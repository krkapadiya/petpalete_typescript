import joi from "joi";

export const allCommunityListDto = joi.object().keys({
  search: joi.string().allow().label("Search"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  lat: joi.allow().label("Lat"),
  long: joi.allow().label("Long"),
  ln: joi.string().allow().label("Ln"),
});

export const communityDetailDto = joi.object().keys({
  community_id: joi.string().allow().label("Community id"),
  ln: joi.string().allow().label("Ln"),
});
