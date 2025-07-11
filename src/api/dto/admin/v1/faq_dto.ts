import joi from "joi";

export const addFaqDto = joi.object().keys({
  question: joi.string().allow().label("Question"),
  answer: joi.string().allow().label("Answer"),
  ln: joi.string().allow().label("Ln"),
});

export const editFaqDto = joi.object().keys({
  faq_id: joi.string().allow().label("Faq id"),
  question: joi.string().allow().label("Question"),
  answer: joi.string().allow().label("Answer"),
  ln: joi.string().allow().label("Ln"),
});

export const deleteFaqDto = joi.object().keys({
  faq_id: joi.string().allow().label("Faq id"),
  ln: joi.string().allow().label("Ln"),
});

export const listFaqDto = joi.object().keys({
  search: joi.string().allow("").label("Search"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});

export const activeDeactiveFaqDto = joi.object().keys({
  faq_id: joi.string().allow().label("Faq id"),
  is_active: joi.allow().label("Is active"),
  ln: joi.string().allow().label("Ln"),
});
