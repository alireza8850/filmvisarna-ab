import React, { FC, useState, useEffect } from "react";
import "./_contactoss.scss";

//Types 
interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};