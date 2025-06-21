from pydantic_settings import BaseSettings, SettingsConfigDict
 


class Settings(BaseSettings) : 
    POSTGRES_USER : str 
    POSTGRES_PASSWORD : str 
    POSTGRES_DB : str
    DATABASE_URL : str  

    JWT_SECRET : str
    ALGORITHM : str

    SMTP_PORT : int 
    SMTP_USER : str 
    SMTP_PASSWORD : str 

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )



Config = Settings()#type: ignore 