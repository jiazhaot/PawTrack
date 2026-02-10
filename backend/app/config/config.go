package config

import (
	"fmt"
	"io/ioutil"
	"log"

	"gopkg.in/yaml.v2"
)

var (
	C = new(Config)
)

type Config struct {
	Version  string   `yaml:"Version"`
	RunMode  string   `yaml:"RunMode"`
	HTTP     HTTP     `yaml:"HTTP"`
	Log      Log      `yaml:"Log"`
	Gorm     Gorm     `yaml:"Gorm"`
	MySQL    MySQL    `yaml:"MySQL"`
	Redis    Redis    `yaml:"Redis"`
	CORS     CORS     `yaml:"CORS"`
	Services Services `yaml:"Services"`
	UserInfo UserInfo `yaml:"UserInfo"`
}

type EmailTemplate struct {
	Captcha      string
	Order        string
	Subscribe    string
	Conversation string
}

// Timer use minutes
type Timer struct {
	OrderUnpaidCancelTime       int `yaml:"OrderUnpaidCancelTime"`
	OrderAwaitConfirmCancelTime int `yaml:"OrderAwaitConfirmCancelTime"`
	OrderPayingCancelTime       int `yaml:"OrderPayingCancelTime"`
	OrderBuyCanCancelRangeLeft  int `yaml:"OrderBuyCanCancelRangeLeft"`
	OrderBuyCanCancelRangeRight int `yaml:"OrderBuyCanCancelRangeRight"`
}

type RocketMQ struct {
	NameServer []string `yaml:"NameServer"`
	EndPoint   string   `yaml:"EndPoint"`
}

type Order struct {
	DeliveryPriceC2C        int     `yaml:"DeliveryPriceC2C"`
	DeliveryPriceNormalS2S  int     `yaml:"DeliveryPriceNormalS2S"`
	DeliveryPriceExpress    int     `yaml:"DeliveryPriceExpress"`
	ServiceFee              float64 `yaml:"ServiceFee"`
	ServiceFeeMin           int     `yaml:"ServiceFeeMin"`
	MinOrderPrice           int     `yaml:"MinOrderPrice"`
	UserC2CLimit0           int     `yaml:"UserC2CLimit0"`
	UserC2CLimit400         int     `yaml:"UserC2CLimit400"`
	UserC2CLimit2000        int     `yaml:"UserC2CLimit2000"`
	UserC2CLimit10000       int     `yaml:"UserC2CLimit10000"`
	UserC2CLimit100000      int     `yaml:"UserC2CLimit100000"`
	UserC2CCancelPunishment int     `yaml:"UserC2CCancelPunishment"`
	AllowCancelCount        int     `yaml:"AllowCancelCount"`
}

type CloudFlare struct {
	TurnstileSecretKey string `yaml:"TurnstileSecretKey"`
}

type Ecpay struct {
	HashKey    string `yaml:"HashKey"`
	HashIV     string `yaml:"HashIV"`
	MerchantID string `yaml:"MerchantID"`

	C2CHashKey    string `yaml:"C2CHashKey"`
	C2CHashIV     string `yaml:"C2CHashIV"`
	C2CMerchantID string `yaml:"C2CMerchantID"`
}

type Invoice struct {
	CompanyId string `yaml:"CompanyId"`
	AppKey    string `yaml:"AppKey"`
}
type PhoneService struct {
	Username string `yaml:"Username"`
	Password string `yaml:"Password"`
}

// UserInfo
type UserInfo struct {
	MaxProductCapacity   int     `yaml:"MaxProductCapacity"`
	MaxImageSizeCapacity int     `yaml:"MaxImageSizeCapacity"`
	MaxFollowing         int     `yaml:"MaxFollowing"`
	CookieExpireTime     int     `yaml:"CookieExpireTime"`
	InviteRateBasic      float64 `yaml:"InviteRateBasic"`
	InviteRate3          float64 `yaml:"InviteRate3"`
	InviteRate15         float64 `yaml:"InviteRate15"`
	InviteRate50         float64 `yaml:"InviteRate50"`
	InviteRate100        float64 `yaml:"InviteRate100"`
	InviteRate200        float64 `yaml:"InviteRate200"`
	PolishCountPerDay    int     `yaml:"PolishCountPerDay"`
	ExpireTime           int     `yaml:"ExpireTime"`
}

// Services
type Services struct {
	MainService    string `yaml:"MainService"`
	SalveService   string `yaml:"SalveService"`
	Domain         string `yaml:"Domain"`
	RedirectPage   string `yaml:"RedirectPage"`
	S3BucketDomain string `yaml:"S3BucketDomain"`
	CronicleApiKey string `yaml:"CronicleApiKey"`
}

// HTTP
type HTTP struct {
	Host            string `yaml:"Host"`
	Port            int    `yaml:"Port"`
	ShutdownTimeout int    `yaml:"ShutdownTimeout"`
	ReadTimeout     int    `yaml:"ReadTimeout"`
	WriteTimeout    int    `yaml:"WriteTimeout"`
	IdleTimeout     int    `yaml:"IdleTimeout"`
	Secure          bool   `yaml:"Secure"`
	DelCookie       int    `yaml:"DelCookie"`
	HttpReadOnly    bool   `yaml:"HttpReadOnly"`
	Domain          string `yaml:"Domain"`
}

// Log
type Log struct {
	Level          int      `yaml:"Level"`
	Format         string   `yaml:"Format"`
	Output         string   `yaml:"Output"`
	OutputFile     string   `yaml:"OutputFile"`
	OutputCronFile string   `yaml:"OutputCronFile"`
	OutputErrFile  string   `yaml:"OutputErrFile"`
	EnableHook     string   `yaml:"EnableHook"`
	HookLevels     []string `yaml:"HookLevels"`
	Hook           string   `yaml:"Hook"`
	HookMaxThread  int      `yaml:"HookMaxThread"`
	HookMaxBuffer  int      `yaml:"HookMaxBuffer"`
	MaxSize        int      `yaml:"MaxSize"`
	MaxBackups     int      `yaml:"MaxBackups"`
	MaxAge         int      `yaml:"MaxAge"`
	Compress       bool     `yaml:"Compress"`
}

// ImageInfo
type ImageInfo struct {
	AvatarPath   string      `yaml:"AvatarPath"`
	CardPath     string      `yaml:"CardPath"`
	CardPackPath string      `yaml:"CardPackPath"`
	CardImgSize  CardImgSize `yaml:"CardImgSize"`
}

type CardImgSize struct {
	Width  int `yaml:"Width"`
	Height int `yaml:"Height"`
}

// Translate
type Translate struct {
	Authorization  string `yaml:"Authorization"`
	DefaultContext string `yaml:"DefaultContext"`
}

// Gorm
type Gorm struct {
	Debug        bool   `yaml:"Debug"`
	DBType       string `yaml:"DBType"`
	MaxLifetime  int    `yaml:"MaxLifetime"`
	MaxOpenConns int    `yaml:"MaxOpenConns"`
	MaxIdleConns int    `yaml:"MaxIdleConns"`
	// TablePrefix  string
}

// MySQL
type MySQL struct {
	// Conn       ConnectionInfo
	Enable     bool   `yaml:"Enable"`
	Host       string `yaml:"Host"`
	Port       int    `yaml:"Port"`
	User       string `yaml:"User"`
	Password   string `yaml:"Password"`
	DBName     string `yaml:"DBName"`
	Parameters string `yaml:"Parameters"`
}

// Redis
type Redis struct {
	Enable   bool   `yaml:"Enable"`
	Host     string `yaml:"Host"`
	Password string `yaml:"Password"`
	DB       int    `yaml:"DB"`
}

// CORS 配置
type CORS struct {
	Enable           bool     `yaml:"Enable"`
	AllowOrigins     []string `yaml:"AllowOrigins"`
	AllowMethods     []string `yaml:"AllowMethods"`
	AllowHeaders     []string `yaml:"AllowHeaders"`
	AllowCredentials bool     `yaml:"AllowCredentials"`
	MaxAge           int      `yaml:"MaxAge"`
}

// DefaultConfig
type DefaultConfig struct {
	Sender   string `yaml:"Sender"`
	Password string `yaml:"Password"`
	Attach   string `yaml:"Attach"`
	Template string `yaml:"Template"`
	Alias    string `yaml:"Alias"`
}

// RetrieveMail
type RetrieveMail struct {
	Subject string `yaml:"Subject"`
	Body    string `yaml:"Body"`
}

// LoadYaml
func LoadYaml(path string) {
	yamlBytes, err := ioutil.ReadFile(path)
	if err != nil {
		log.Printf("yaml File get err #%v ", err)
	}
	err = yaml.Unmarshal(yamlBytes, C)
	if err != nil {
		log.Fatal("Unmarshall", err)
	}
}

// GetConfig
func (c *Config) GetConfig() *Config {
	return c
}

// DSN
func (a MySQL) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?%s", a.User, a.Password, a.Host, a.Port, a.DBName, a.Parameters)
}
