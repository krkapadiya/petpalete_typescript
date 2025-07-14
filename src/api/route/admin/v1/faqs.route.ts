import express from "express";
const admin_router = express.Router();
import multipart from "connect-multiparty";
const multipartMiddleware = multipart();
import { userAuth } from "../../../middlewares/auth";
import { validateRequest } from "../../../middlewares/validation";

import {
  addFaq,
  editFaq,
  deleteFaq,
  listFaq,
  activeDeactiveFaq,
} from "./../../../controller/admin/v1/faq.controller";

import {
  addFaqDto,
  editFaqDto,
  deleteFaqDto,
  listFaqDto,
  activeDeactiveFaqDto,
} from "./../../../dto/admin/v1/faq_dto";

admin_router.post(
  "/add_faq",
  userAuth,
  multipartMiddleware,
  validateRequest(addFaqDto),
  addFaq,
);
admin_router.post(
  "/edit_faq",
  userAuth,
  multipartMiddleware,
  validateRequest(editFaqDto),
  editFaq,
);
admin_router.post(
  "/delete_faq",
  userAuth,
  multipartMiddleware,
  validateRequest(deleteFaqDto),
  deleteFaq,
);
admin_router.post(
  "/list_faq",
  userAuth,
  multipartMiddleware,
  validateRequest(listFaqDto),
  listFaq,
);
admin_router.post(
  "/active_deactive_faq",
  userAuth,
  multipartMiddleware,
  validateRequest(activeDeactiveFaqDto),
  activeDeactiveFaq,
);

export default admin_router;
