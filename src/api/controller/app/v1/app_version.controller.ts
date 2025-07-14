import i18n from "i18n";
import { Request, Response } from "express";

import { app_versions } from "./../../../model/model.app_versions";
import { app_contents } from "./../../../model/model.app_contents";

import { errorRes, successRes } from "./../../../../util/response_functions";

export const addAppVersion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      app_version,
      is_maintenance,
      app_update_status,
      app_platform,
      app_url,
      api_base_url,
      is_live,
      ln,
    } = req.body;

    i18n.setLocale(req, ln);

    const insert_qry = await app_versions.create({
      app_version,
      is_maintenance,
      app_update_status,
      app_platform,
      app_url,
      api_base_url,
      is_live,
    });

    await successRes(
      res,
      res.__("App version added successfully."),
      insert_qry,
    );
    return;
  } catch (error) {
    console.log(error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const appVersionCheck = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { app_version, app_platform, ln } = req.body;

    i18n.setLocale(req, ln);

    const result: {
      is_need_update?: boolean;
      is_force_update?: boolean;
      is_maintenance?: boolean;
    } = {};

    const check_version = await app_versions.findOne({
      app_version: app_version,
      is_live: true,
      app_platform: app_platform,
      is_deleted: false,
    });

    if (check_version) {
      if (check_version.app_version !== app_version) {
        result.is_need_update = true;
        result.is_force_update =
          check_version.app_update_status === "is_force_update";
      } else {
        result.is_need_update = false;
        result.is_force_update = false;
      }

      result.is_maintenance = check_version.is_maintenance;
    } else {
      const fallback_version = await app_versions.findOne({
        is_live: true,
        app_platform: app_platform,
        is_deleted: false,
      });

      result.is_need_update = true;
      result.is_force_update =
        fallback_version?.app_update_status === "is_force_update";
      result.is_maintenance = fallback_version?.is_maintenance ?? false;
    }

    const [find_terms_and_condition, find_privacy_policy, find_about] =
      await Promise.all([
        app_contents.findOne({
          content_type: "terms_and_condition",
          is_deleted: false,
        }),
        app_contents.findOne({
          content_type: "privacy_policy",
          is_deleted: false,
        }),
        app_contents.findOne({ content_type: "about", is_deleted: false }),
      ]);

    const result_data = {
      ...result,
      terms_and_condition: find_terms_and_condition?.content ?? "",
      privacy_policy: find_privacy_policy?.content ?? "",
      about: find_about?.content ?? "",
    };

    await successRes(
      res,
      res.__("App version updated successfully."),
      result_data,
    );
    return;
  } catch (error) {
    console.error("Error in appVersionCheck:", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};
