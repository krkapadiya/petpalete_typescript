import { Response } from "express";

// ============ Express Response Handlers ============

export const successRes = async (res: Response, msg: string, data: unknown) => {
  return res.send({
    success: true,
    statuscode: 1,
    message: msg,
    data: data,
  });
};

export const warningRes = async (res: Response, msg: string) => {
  return res.send({
    success: false,
    statuscode: 2,
    message: msg,
  });
};

export const multiSuccessRes = async (
  res: Response,
  msg: string,
  total_count: number,
  data: unknown,
) => {
  return res.send({
    success: true,
    statuscode: 1,
    message: msg,
    total_number_of_data: total_count,
    data: data,
  });
};

export const countMultiSuccessRes = async (
  res: Response,
  msg: string,
  total_count: number,
  total_amount: number,
  data: unknown,
) => {
  return res.send({
    success: true,
    statuscode: 1,
    message: msg,
    total_number_of_data: total_count,
    total_amount: total_amount,
    data: data,
  });
};

export const tokenSuccessRes = async (
  res: Response,
  msg: string,
  token: string,
  data: unknown,
) => {
  return res.send({
    success: true,
    statuscode: 1,
    message: msg,
    token: token,
    data: data,
  });
};

export const manyMultiSuccessRes = async (
  res: Response,
  msg: string,
  data: unknown,
  total_count: number,
  page_count: number,
) => {
  return res.send({
    success: true,
    statuscode: 1,
    message: msg,
    total_number_of_data: total_count,
    page_no_count: page_count,
    data: data,
  });
};

export const errorRes = async (res: Response, msg: string) => {
  return res.send({
    success: false,
    statuscode: 0,
    message: msg,
  });
};

export const authFailRes = async (res: Response, msg: string) => {
  return res.status(401).json({
    success: false,
    statuscode: 101,
    message: msg,
  });
};

export const maintenanceMode = async (res: Response, msg: string) => {
  return res.status(503).json({
    success: false,
    statuscode: 503,
    message: msg,
  });
};

export const webAuthFailRes = async (res: Response, msg: string) => {
  return res.send({
    success: false,
    statuscode: 101,
    message: msg,
  });
};

// ============ Socket Response Handlers ============

export const socketSuccessRes = async (msg: string, data: unknown) => {
  return {
    success: true,
    statuscode: 1,
    message: msg,
    data: data,
  };
};

export const socketMultiSuccessRes = async (
  msg: string,
  total_count: number,
  data: unknown,
) => {
  return {
    success: true,
    statuscode: 1,
    message: msg,
    total_number_of_data: total_count,
    data: data,
  };
};

interface ErrorResponse {
  success: boolean;
  statuscode: number;
  message: string;
  data: unknown[];
}

export const socketErrorRes = async (msg: string): Promise<ErrorResponse> => {
  return {
    success: false,
    statuscode: 0,
    message: msg,
    data: [],
  };
};

export const InternalErrorRes = async (): Promise<ErrorResponse> => {
  return {
    success: false,
    statuscode: 0,
    message: "Internal server error",
    data: [],
  };
};
