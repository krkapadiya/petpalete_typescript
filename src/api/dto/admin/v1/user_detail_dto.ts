import joi from "joi";

export const allUserListDto = joi.object().keys({
  search: joi.string().allow("").label("Search"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});

export const userDetailsDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  ln: joi.string().allow().label("Ln"),
});

export const blockUnblockUserDto = joi.object().keys({
  block_user_id: joi.string().allow().label("Block user ID"),
  is_block: joi.string().allow().label("Is block"),
  ln: joi.string().allow().label("Ln"),
});

export const userPetsDto = joi.object().keys({
  profile_user_id: joi.string().allow().label("Profile user id"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});

export const userPetFavoritesDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});

export const userServicesDto = joi.object().keys({
  profile_user_id: joi.string().allow().label("Profile user id"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});

export const userServiceFavoritesDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});

export const userCommunitiesDto = joi.object().keys({
  profile_user_id: joi.string().allow().label("Profile user id"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});

export const userReviewsDto = joi.object().keys({
  reviewed_user_id: joi.string().allow().label("Reviewed user id"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});

export const paymentListDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});

export const allPaymentsDto = joi.object().keys({
  search: joi.string().allow("").label("Search"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  fromDate: joi.allow().label("From date"),
  toDate: joi.allow().label("To date"),
  ln: joi.string().allow().label("Ln"),
});
