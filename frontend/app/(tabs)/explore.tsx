import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import {
  StyleSheet,
  View,
  Text,
  Platform,
  Linking,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import * as Location from 'expo-location'
import MapView, { Marker, Region, MapPressEvent, PROVIDER_DEFAULT } from 'react-native-maps'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@/constants/theme/Colors'
import { Appearance } from 'react-native'
import { ApiService, BinData, CreateBinPayload } from '@/services/api'
// import BigDogAlert from '@/components/map/BigDogAlert'

Appearance.setColorScheme('light')

type FacilityType = 'cafe' | 'restaurant' | 'park' | 'dog_park'
type FacilitySource = 'osm'

interface Facility {
  id: string
  name: string
  type: FacilityType
  lat: number
  lng: number
  address?: string
  source: FacilitySource
  tags?: string[]
  extras?: {
    outdoorSeating?: boolean
    offLeash?: boolean
    leashRequired?: boolean
    waterBowl?: boolean
    pooBin?: boolean
  }
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

export default function ExploreScreen() {
  const insets = useSafeAreaInsets()

  const [currentLocation, setCurrentLocation] = useState<Region | null>(null)
  const [mapRegion, setMapRegion] = useState<Region | null>(null)

  const [facilities, setFacilities] = useState<Facility[]>([])
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [loadingFacilities, setLoadingFacilities] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [filters, setFilters] = useState<Record<FacilityType, boolean>>({
    dog_park: true,
    park: true,
    cafe: true,
    restaurant: true,
  })

  const [rateLimitCount, setRateLimitCount] = useState(0)

  // Bin-related states
  const [bins, setBins] = useState<BinData[]>([])
  const [selectedBin, setSelectedBin] = useState<BinData | null>(null)
  const [loadingBins, setLoadingBins] = useState(false)
  const [isAddingBin, setIsAddingBin] = useState(false)
  const [binFilter, setBinFilter] = useState<'all' | 'own'>('all')
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)

  const mapRef = useRef<MapView>(null)
  const fetchTimer = useRef<NodeJS.Timeout | null>(null)
  const lastFetchCenterRef = useRef<{ lat: number; lng: number } | null>(null)

  const getCurrentLocation = useCallback(async () => {
    try {
      const position = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = position.coords
      const region: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
      setCurrentLocation(region)
      setMapRegion(region)
    } catch (error) {
      setErrorMsg('Unable to obtain current location.')
    }
  }, [])

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') await getCurrentLocation()
      else setErrorMsg('Location permission is not authorized.')
    } catch {
      setErrorMsg('An error occurred while requesting location permission.')
    }
  }, [getCurrentLocation])

  useEffect(() => {
    requestLocationPermission()
  }, [requestLocationPermission])

  // Reload bins when filter changes, but avoid infinite loops
  useEffect(() => {
    if (mapRegion) {
      loadBinsForRegion(mapRegion)
    }
  }, [binFilter]) // Only depend on binFilter, not mapRegion to avoid loops


  const computeRadiusMeters = (region: Region): number => {
    const latMeters = region.latitudeDelta * 111_000
    const lngMeters = region.longitudeDelta * 111_000 * Math.cos((region.latitude * Math.PI) / 180)
    return Math.round(Math.max(800, Math.min(2500, Math.max(latMeters, lngMeters) * 0.5)))
  }

  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (x: number) => (x * Math.PI) / 180
    const R = 6371000
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
    return 2 * R * Math.asin(Math.sqrt(a))
  }

  const fetchFacilitiesFromOverpass = useCallback(async (lat: number, lng: number, radius: number, retryCount = 0) => {
    try {
      const query = `
        [out:json][timeout:25];
        (
          node(around:${radius},${lat},${lng})["leisure"="dog_park"];
          way(around:${radius},${lat},${lng})["leisure"="dog_park"];
          relation(around:${radius},${lat},${lng})["leisure"="dog_park"];
          node(around:${radius},${lat},${lng})["leisure"~"^(park|garden|recreation_ground|village_green)$"]["name"];
          way(around:${radius},${lat},${lng})["leisure"~"^(park|garden|recreation_ground|village_green)$"]["name"];
          relation(around:${radius},${lat},${lng})["leisure"~"^(park|garden|recreation_ground|village_green)$"]["name"];
          node(around:${radius},${lat},${lng})["amenity"~"cafe|restaurant"]["outdoor_seating"="yes"]["name"];
          way(around:${radius},${lat},${lng})["amenity"~"cafe|restaurant"]["outdoor_seating"="yes"]["name"];
        );
        out center 100;
      `

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const res = await fetch(OVERPASS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        if (res.status === 429) {
          if (retryCount < 2) {
            const backoffDelay = Math.min(5000 * Math.pow(2, retryCount), 30000) // Longer delays
            // Silently handle rate limiting without user-visible logs
            await new Promise(resolve => setTimeout(resolve, backoffDelay))
            return fetchFacilitiesFromOverpass(lat, lng, radius, retryCount + 1)
          } else {
            // Rate limit exceeded - return empty results silently
            return [] // Return empty array instead of throwing
          }
        }
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const json = await res.json()
      return (json?.elements || []).map((el: any) => {
        const center = el.center || { lat: el.lat, lon: el.lon }
        const tags = el.tags || {}
        let type: FacilityType = 'park'
        if (tags.leisure === 'dog_park') type = 'dog_park'
        else if (tags.amenity === 'cafe') type = 'cafe'
        else if (tags.amenity === 'restaurant') type = 'restaurant'
        return {
          id: `${el.type}/${el.id}`,
          name: tags.name || (type === 'dog_park' ? 'Dog Park' : 'Unnamed'),
          type,
          lat: center.lat,
          lng: center.lon,
          address: tags['addr:full'] || tags['addr:street'],
          source: 'osm',
          tags: [
            ...(tags.dogs ? [`dogs:${tags.dogs}`] : []),
            ...(tags.outdoor_seating === 'yes' ? ['outdoor-seating'] : []),
          ],
        }
      })
    } catch (error) {
      // Handle AbortError silently - this is expected behavior for cancelled requests
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled or timed out - this is normal behavior
        return []
      }

      if (retryCount < 2 && !(error instanceof Error && error.message.includes('status: 429'))) {
        const retryDelay = 1000 * (retryCount + 1)
        // Silently retry without logging to avoid user confusion
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        return fetchFacilitiesFromOverpass(lat, lng, radius, retryCount + 1)
      }

      throw error
    }
  }, [])

  const loadFacilitiesForRegion = useCallback(async (region: Region) => {
    const center = { lat: region.latitude, lng: region.longitude }
    const last = lastFetchCenterRef.current
    const moved = last ? haversine(center.lat, center.lng, last.lat, last.lng) : Infinity
    if (moved < 500) return
    
    // Clear old facility data when starting to load
    setFacilities([])
    setSelectedFacility(null)
    setLoadingFacilities(true)
    try {
      const radius = computeRadiusMeters(region)
      const data = await fetchFacilitiesFromOverpass(center.lat, center.lng, radius)
      lastFetchCenterRef.current = center
      setFacilities(data)
      // Reset rate limit counter on successful request
      setRateLimitCount(0)
    } catch (error) {
      // Handle errors gracefully without showing technical details to users
      if (error instanceof Error && error.message.includes('status: 429')) {
        setRateLimitCount(prev => prev + 1)
        setErrorMsg('Rate limited - keeping existing facilities visible.')

        // Show rate limit message
        if (rateLimitCount >= 3) {
          setErrorMsg('Too many rate limit errors. Please use manual refresh.')
        }
      } else {
        setErrorMsg('Failed to obtain nearby facilities.')
      }
    } finally {
      setLoadingFacilities(false)
    }
  }, [fetchFacilitiesFromOverpass])

  const onRegionChangeComplete = (r: Region) => {
    setMapRegion(r)
    // Remove auto-refresh logic, only update map region state
    // Users need to manually click refresh button to update facilities
  }

  const handleMapPress = (event: MapPressEvent) => {
    if (event.nativeEvent.action === 'marker-press') return
    setSelectedFacility(null)
    setSelectedBin(null)
    
    if (isAddingBin) {
      const coordinate = event.nativeEvent.coordinate
      Alert.alert(
        'Add Bin',
        'Do you want to add a dog waste bin at this location?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Add', 
            onPress: async () => {
              const success = await createBin(coordinate.latitude, coordinate.longitude)
              if (success) {
                setIsAddingBin(false)
              }
            }
          }
        ]
      )
      return
    }
  }

  const toggleFilter = (k: FacilityType) => setFilters(prev => ({ ...prev, [k]: !prev[k] }))
  const filteredFacilities = useMemo(() => facilities.filter(f => filters[f.type]), [facilities, filters])
  
  const filteredBins = useMemo(() => {
    console.log('Showing bins - binFilter:', binFilter, 'total bins:', bins.length)
    // No client-side filtering needed since API does the filtering
    return bins
  }, [bins])

  const loadBinsForRegion = useCallback(async (region: Region) => {
    console.log('Loading bins for region:', region, 'filter:', binFilter)

    // Clear old bin data when starting to load
    setBins([])
    setSelectedBin(null)
    setLoadingBins(true)
    try {
      // Use appropriate API based on filter
      const response = binFilter === 'own'
        ? await ApiService.listMyBins()
        : await ApiService.listAllBins()

      console.log(`${binFilter === 'own' ? 'List my bins' : 'List all bins'} response:`, response)

      if (response.success && response.data) {
        console.log('Raw bins data:', response.data)

        const filteredBins = response.data.filter(bin => {
          const distance = haversine(region.latitude, region.longitude, bin.latitude, bin.longitude)
          console.log(`Bin at ${bin.latitude}, ${bin.longitude} - distance: ${distance}m`)
          return distance <= 50000 // 50km radius to include more bins
        })

        console.log('Distance filtered bins:', filteredBins)

        const currentUserId = ApiService.getCurrentUserId()
        console.log('Current user ID from token:', currentUserId)

        const binsWithOwnership = filteredBins.map(bin => {
          const binUserId = bin.UserId || bin.userId
          // For 'own' filter, all bins should be owned since they come from listMyBins
          const isOwned = binFilter === 'own' ? true : (currentUserId !== null && binUserId === currentUserId)
          console.log(`Bin ${bin.ID || bin.id}: UserId=${binUserId}, currentUserId=${currentUserId}, isOwned=${isOwned}`)
          return {
            ...bin,
            isOwned: isOwned
          }
        })

        console.log('Final bins with ownership:', binsWithOwnership)
        setBins(binsWithOwnership)
      } else {
        console.log('Failed to load bins - response not successful')
        setBins([])
      }
    } catch (error) {
      // Handle errors gracefully without showing technical details to users
      if (error instanceof Error && error.message.includes('401')) {
        setErrorMsg('Authentication failed. Please log in again.')
      } else {
        setErrorMsg('Failed to load bins.')
      }
      setBins([])
    } finally {
      setLoadingBins(false)
    }
  }, [binFilter])

  // Auto-refresh facilities and bins on initial load
  useEffect(() => {
    if (mapRegion && !facilities.length && !bins.length) {
      // Only auto-load on first location acquisition
      loadFacilitiesForRegion(mapRegion)
      loadBinsForRegion(mapRegion)
    }
  }, [mapRegion, loadFacilitiesForRegion, loadBinsForRegion, facilities.length, bins.length])

  const handleManualRefresh = useCallback(() => {
    if (mapRegion) {
      // First clear old data, then load new data
      setFacilities([])
      setBins([])
      setSelectedFacility(null)
      setSelectedBin(null)

      // Then load facilities and bins for the new region
      loadFacilitiesForRegion(mapRegion)
      loadBinsForRegion(mapRegion)
    }
  }, [mapRegion, loadFacilitiesForRegion, loadBinsForRegion])

  const createBin = useCallback(async (latitude: number, longitude: number) => {
    try {
      console.log('Creating bin at:', latitude, longitude)
      const binData: CreateBinPayload = {
        latitude,
        longitude
      }
      console.log('Bin data to send:', binData)
      const response = await ApiService.createBin(binData)
      console.log('Create bin response:', response)

      if (response.success && response.data) {
        const currentUserId = ApiService.getCurrentUserId()
        const newBin = {
          ...response.data,
          isOwned: true,
          UserId: response.data.UserId || response.data.userId || currentUserId || undefined
        }
        console.log('Adding new bin to state:', newBin)
        console.log('New bin UserId:', newBin.UserId, 'isOwned:', newBin.isOwned)
        setBins(prev => {
          const updated = [...prev, newBin]
          console.log('Updated bins array:', updated)
          return updated
        })
        return true
      }
      console.log('Create bin failed - response not successful')
      return false
    } catch (error) {
      // Handle errors gracefully without showing technical details to users
      Alert.alert('Error', 'Failed to create bin. Please try again.')
      return false
    }
  }, [])

  const deleteBin = useCallback(async (binId: number) => {
    try {
      const response = await ApiService.deleteBin(binId)
      if (response.success) {
        setBins(prev => prev.filter(bin => (bin.ID || bin.id) !== binId))
        setSelectedBin(null)
        return true
      }
      return false
    } catch (error) {
      // Handle errors gracefully without showing technical details to users
      Alert.alert('Error', 'Failed to delete bin. Please try again.')
      return false
    }
  }, [])

  const iconFor = (t: FacilityType) => {
    switch (t) {
      case 'dog_park': return '🦮'
      case 'park': return '⛲️'
      case 'cafe': return '☕️'
      case 'restaurant': return '🍽️'
      default: return '📍'
    }
  }

  const backgroundColorFor = (t: FacilityType) => {
    switch (t) {
      case 'dog_park': return '#E3F2FD'
      case 'park': return '#E8F5E8'
      case 'cafe': return '#FFF3E0'
      case 'restaurant': return '#FFEBEE'
      default: return '#F5F5F5'
    }
  }

  const openInMaps = (lat: number, lng: number, label?: string) => {
    const q = encodeURIComponent(label || 'Destination')
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${lat},${lng}&q=${q}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${q})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    })!
    Linking.openURL(url).catch(() => {})
  }

  if (!currentLocation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading map...</Text>
          <Text style={styles.subText}>Please enable location services</Text>
          {errorMsg && <Text style={[styles.subText, { color: '#D32F2F', marginTop: 8 }]}>{errorMsg}</Text>}
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <View style={[styles.topOverlay]}>
          <View style={styles.titleBar}>
            <Text style={styles.titleText}>Dog-Friendly Facilities Nearby</Text>
          </View>

          {/* Add Bin Instructions */}
          {isAddingBin && (
            <View style={styles.instructionBar}>
              <Text style={styles.instructionText}>📍 Tap on the map to add a bin</Text>
            </View>
          )}

        </View>

        {/* Expanded filter menu */}
        {isFilterMenuOpen && (
          <View style={styles.filterMenu}>


            {/* Facility type filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Facilities</Text>
              {(['dog_park', 'park', 'cafe', 'restaurant'] as FacilityType[]).map(k => {
                const on = filters[k]
                return (
                  <TouchableOpacity
                    key={k}
                    style={[styles.filterMenuItem, on ? styles.filterMenuItemOn : styles.filterMenuItemOff]}
                    onPress={() => toggleFilter(k)}>
                    <Text style={styles.filterMenuItemText}>
                      {iconFor(k)} {k.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Bin filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Bins</Text>
              <TouchableOpacity
                style={[styles.filterMenuItem, binFilter === 'all' ? styles.filterMenuItemOn : styles.filterMenuItemOff]}
                onPress={() => setBinFilter('all')}>
                <Text style={styles.filterMenuItemText}>🗑️ All Bins</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.filterMenuItem, binFilter === 'own' ? styles.filterMenuItemOn : styles.filterMenuItemOff]}
                onPress={() => setBinFilter('own')}>
                <Text style={styles.filterMenuItemText}>🗑️ My Bins</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={currentLocation}
          showsUserLocation
          showsMyLocationButton={false}
          onPress={handleMapPress}
          onRegionChangeComplete={onRegionChangeComplete}
          userInterfaceStyle="light">
          {filteredFacilities.map(f => (
            <Marker key={f.id} coordinate={{ latitude: f.lat, longitude: f.lng }} title={f.name}
              onPress={() => { setSelectedFacility(f); setSelectedBin(null) }}>
              <View style={[styles.customMarker, { backgroundColor: backgroundColorFor(f.type) }]}>
                <Text style={styles.markerIcon}>{iconFor(f.type)}</Text>
              </View>
            </Marker>
          ))}
          {filteredBins.map(bin => (
            <Marker key={bin.ID || bin.id || `bin_${bin.latitude}_${bin.longitude}`} coordinate={{ latitude: bin.latitude, longitude: bin.longitude }} title="Dog Waste Bin"
              onPress={() => { setSelectedBin(bin); setSelectedFacility(null) }}>
              <View style={[styles.binMarker, { backgroundColor: bin.isOwned ? '#FFCDD2' : '#E8F5E8' }]}>
                <Text style={styles.markerIcon}>🗑️</Text>
              </View>
            </Marker>
          ))}
          
          {/* BigDogAlert Component
          <BigDogAlert currentLocation={currentLocation} mapRef={mapRef} /> */}
        </MapView>

        {/* Right vertical button area */}
        <View style={styles.rightButtonPanel}>
          {/* Filter button */}
          <TouchableOpacity
            style={[
              styles.verticalButton,
              {
                backgroundColor: isFilterMenuOpen ? '#FFD54F' : '#FFF5D6',
                borderColor: isFilterMenuOpen ? '#F9A825' : '#D8D2B0',
                transform: [{ scale: isFilterMenuOpen ? 1.05 : 1 }]
              },
            ]}
            onPress={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
          >
            <Text style={styles.verticalButtonTextSmall}>Filter</Text>
          </TouchableOpacity>

          {/* Create bin button */}
          <TouchableOpacity
            style={[
              styles.verticalButton,
              {
                backgroundColor: isAddingBin ? '#FFD54F' : '#FFF5D6',
                borderColor: isAddingBin ? '#F9A825' : '#D8D2B0',
                transform: [{ scale: isAddingBin ? 1.05 : 1 }]
              },
            ]}
            onPress={() => {
              setIsAddingBin(!isAddingBin)
              setSelectedFacility(null)
              setSelectedBin(null)
            }}
          >
            <View style={styles.addBinButtonContent}>
              <Text style={styles.verticalButtonTextSmall}>Add Bin</Text>
            </View>
          </TouchableOpacity>

          {/* Refresh button */}
          <TouchableOpacity
            style={[
              styles.verticalButton,
              {
                backgroundColor: '#BBDEFB',
                borderColor: '#1976D2',
                transform: [{ scale: loadingFacilities ? 0.95 : 1 }]
              },
            ]}
            onPress={handleManualRefresh}
          >
            <Text style={styles.verticalButtonText}>{loadingFacilities ? '⏳' : '↻'}</Text>
          </TouchableOpacity>
        </View>

        {selectedFacility && (
          <View style={[styles.bottomCard, { bottom: insets.bottom + 20 }]}>
            <Text style={styles.bottomTitle}>{selectedFacility.name}  #{selectedFacility.type}</Text>
            {selectedFacility.address && <Text style={styles.bottomSub}>{selectedFacility.address}</Text>}
            {!!selectedFacility.tags?.length && <Text style={styles.bottomSub}>{selectedFacility.tags.join(' · ')}</Text>}
            <View style={styles.bottomButtons}>
              <TouchableOpacity style={styles.navButton}
                onPress={() => openInMaps(selectedFacility.lat, selectedFacility.lng, selectedFacility.name)}>
                <Text>Open in Maps</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedFacility(null)}>
                <Text>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {selectedBin && (
          <View style={[styles.bottomCard, { bottom: insets.bottom + 20 }]}>
            <Text style={styles.bottomTitle}>🗑️ Dog Waste Bin</Text>
            <Text style={styles.bottomSub}>
              {selectedBin.isOwned ? 'Added by you' : 'Added by community'}
            </Text>
            <View style={styles.bottomButtons}>
              <TouchableOpacity style={styles.navButton}
                onPress={() => openInMaps(selectedBin.latitude, selectedBin.longitude, 'Dog Waste Bin')}>
                <Text>Open in Maps</Text>
              </TouchableOpacity>
              {selectedBin.isOwned && (
                <TouchableOpacity style={styles.deleteButton}
                  onPress={() => {
                    Alert.alert(
                      'Delete Bin',
                      'Are you sure you want to delete this bin?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Delete', 
                          style: 'destructive',
                          onPress: async () => {
                            const binId = selectedBin.ID || selectedBin.id
                            if (binId) {
                              const success = await deleteBin(Number(binId))
                              if (success) {
                                setSelectedBin(null)
                              }
                            }
                          }
                        }
                      ]
                    )
                  }}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedBin(null)}>
                <Text>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  subText: { fontSize: 14, color: '#666' },
  topOverlay: {
    position: 'absolute', left: 0, right: 0, top: 0,
    paddingHorizontal: 12, zIndex: 999, elevation: 10,
  },
  titleBar: {
    marginHorizontal: -12,
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  instructionBar: {
    backgroundColor: '#FFE082',
    borderWidth: 2,
    borderColor: '#FFC107',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginTop: 6,
    marginHorizontal: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'center',
    fontWeight: '600',
  },
  rightButtonPanel: {
    position: 'absolute',
    right: 12,
    top: 120,
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  verticalButton: {
    width: 70,
    height: 56,
    borderRadius: 8, // Rounded rectangle
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  verticalButtonText: { fontSize: 20 },
  verticalButtonTextSmall: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.textSecondary,
  },
  verticalButtonIcon: {
    fontSize: 16,
    marginBottom: 2
  },
  addBinButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterMenu: {
    position: 'absolute',
    top: 120,
    right: 80, // Move to the left side of the button, avoid overlap
    backgroundColor: '#FFF5E6',
    borderWidth: 2,
    borderRadius: 15,
    padding: 12,
    borderColor: Colors.border,
    zIndex: 1000,
    elevation: 10,
    minWidth: 200,
  },
  filterMenuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: Colors.primary,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: Colors.textSecondary,
  },
  filterMenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
  },
  filterMenuItemOn: {
    backgroundColor: '#FFE27A',
    borderColor: '#C5B36A',
  },
  filterMenuItemOff: {
    backgroundColor: '#FFF5D6',
    borderColor: '#D8D2B0',
  },
  filterMenuItemText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  bottomCard: {
    position: 'absolute', left: 20, right: 20,
    backgroundColor: '#FFF5E6', borderWidth: 2, borderRadius: 10, padding: 12,
    borderColor: Colors.border
  },
  bottomTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  bottomSub: { fontSize: 13, color: '#666', marginBottom: 4 },
  bottomButtons: { flexDirection: 'row', marginTop: 6 },
  navButton: { backgroundColor: '#FFD400', padding: 8, borderRadius: 6, marginRight: 8 },
  closeButton: { backgroundColor: '#ddd', padding: 8, borderRadius: 6 },
  customMarker: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 20,
  },
  binMarker: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
})
