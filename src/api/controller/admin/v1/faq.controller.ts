import i18n from "i18n";
import { faqs } from "./../../../model/model.faqs";
import {
  errorRes,
  successRes,
  multiSuccessRes,
} from "../../../../util/response_functions";
import {
  findFaqByName,
  escapeRegex,
  findFaq,
} from "./../../../../util/user_function";
import { Request, Response } from "express";

export const addFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, answer, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_faq = await findFaqByName(question);

    if (find_faq) {
      await errorRes(res, res.__("The FAQ already exists."));
      return;
    }

    const create_faq = await faqs.create({
      question: question,
      answer: answer,
    });

    await successRes(
      res,
      res.__("The FAQ has been successfully added."),
      create_faq,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const editFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const { faq_id, question, answer, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_faq = await findFaq(faq_id);

    if (!find_faq) {
      await errorRes(res, res.__("The FAQ was not found."));
      return;
    }

    const find_exists_faq = await faqs.findOne({
      _id: { $ne: faq_id },
      question: question,
    });

    if (find_exists_faq) {
      await errorRes(res, res.__("The FAQ already exists."));
      return;
    }

    await faqs.updateOne(
      {
        _id: faq_id,
      },
      {
        $set: {
          question: question,
          answer: answer,
        },
      },
    );

    const find_updated_faq = await findFaq(faq_id);

    await successRes(
      res,
      res.__("The FAQ has been successfully updated."),
      find_updated_faq,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const deleteFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const { faq_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_faq = await findFaq(faq_id);

    if (!find_faq) {
      await errorRes(res, res.__("The FAQ was not found."));
      return;
    }

    await faqs.deleteOne({ _id: faq_id });

    await successRes(res, res.__("The FAQ has been successfully deleted."), []);
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const listFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search = "", page = 1, limit = 10, ln } = req.body;
    i18n.setLocale(req, ln);

    const escapedSearch = search ? await escapeRegex(search) : null;

    const list_faq = await faqs.aggregate([
      {
        $match: search
          ? {
              $or: [
                { question: { $regex: escapedSearch, $options: "i" } },
                { answer: { $regex: escapedSearch, $options: "i" } },
              ],
            }
          : {},
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: (parseInt(page) - 1) * parseInt(limit),
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: {
          _id: 1,
          question: 1,
          answer: 1,
          is_active: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    const faq_list_count = await faqs.countDocuments(
      escapedSearch
        ? {
            $or: [
              { question: { $regex: escapedSearch, $options: "i" } },
              { answer: { $regex: escapedSearch, $options: "i" } },
            ],
          }
        : {},
    );

    await multiSuccessRes(
      res,
      res.__("The FAQ list has been successfully retrieved."),
      faq_list_count,
      list_faq,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const activeDeactiveFaq = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { faq_id, is_active, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_faq = await findFaq(faq_id);

    if (!find_faq || "success" in find_faq) {
      await errorRes(res, res.__("The FAQ was not found."));
      return;
    }

    if (is_active === true || is_active === "true") {
      if (find_faq.is_active === true) {
        await successRes(res, res.__("The FAQ is already activated."), []);
        return;
      } else {
        await faqs.updateOne(
          {
            _id: faq_id,
          },
          {
            $set: {
              is_active: true,
            },
          },
        );

        await successRes(
          res,
          res.__("The FAQ has been successfully activated."),
          [],
        );
        return;
      }
    }

    if (is_active === false || is_active === "false") {
      if (find_faq.is_active === false) {
        await successRes(res, res.__("The FAQ is already deactivated."), []);
        return;
      } else {
        await faqs.updateOne(
          {
            _id: faq_id,
          },
          {
            $set: {
              is_active: false,
            },
          },
        );

        await successRes(
          res,
          res.__("The FAQ has been successfully deactivated."),
          [],
        );
        return;
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};
