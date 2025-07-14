import i18n from "i18n";
import { Request, Response } from "express";
import { app_contents } from "../../../model/model.app_contents";

import { errorRes, successRes } from "../../../../util/response_functions";

import { findContentByType, findContent } from "../../../../util/user_function";

export const addContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { content_type, content, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_content = await findContentByType(content_type);

    if (find_content) {
      await errorRes(res, res.__("The content already exists."));
      return;
    }

    const insert_data = {
      content_type,
      content,
    };

    const create_content = await app_contents.create(insert_data);

    await successRes(
      res,
      res.__("The content has been successfully created."),
      create_content,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const editContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { content_id, content, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_content = await findContent(content_id);

    if (!find_content) {
      await errorRes(res, res.__("Content not found."));
      return;
    }

    const update_data = {
      content,
    };

    await app_contents.findByIdAndUpdate(
      {
        _id: content_id,
      },
      {
        $set: update_data,
      },
    );

    const find_updated_content = await findContent(content_id);

    await successRes(
      res,
      res.__("The content has been successfully updated."),
      find_updated_content,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const deleteContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { content_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_content = await findContent(content_id);

    if (!find_content) {
      await errorRes(res, res.__("Content not found."));
      return;
    }

    const update_data = {
      is_deleted: true,
    };

    await app_contents.findByIdAndUpdate(
      {
        _id: content_id,
      },
      {
        $set: update_data,
      },
    );

    await successRes(
      res,
      res.__("The content has been successfully deleted."),
      [],
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const getContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { ln } = req.body;
    i18n.setLocale(req, ln);

    const find_content = await app_contents.find({
      is_deleted: false,
    });

    if (!find_content) {
      await errorRes(res, res.__("Content not found."));
      return;
    }

    await successRes(
      res,
      res.__("The content has been successfully retrieved."),
      find_content,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};
