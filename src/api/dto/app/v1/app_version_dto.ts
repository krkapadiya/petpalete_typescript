import joi from "joi";

export const addAppVersionDto = joi.object().keys({
  app_version: joi.string().allow().label("App version"),
  is_maintenance: joi.string().allow().label("Is maintenance"),
  app_update_status: joi.string().allow().label("App update status"),
  app_platform: joi.string().allow().label("App platform"),
  app_url: joi.string().allow().label("App url"),
  api_base_url: joi.string().allow().label("Api base url"),
  is_live: joi.string().allow().label("Is live"),
  ln: joi.string().allow().label("Ln"),
});

export const appVersionCheckDto = joi.object().keys({
  app_version: joi.string().allow().label("App version"),
  app_platform: joi.string().allow().label("App platform"),
  ln: joi.string().allow().label("Ln"),
});
