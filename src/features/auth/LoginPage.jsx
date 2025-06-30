// src/features/auth/LoginPage.jsx
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLoginMutation } from "../../api/authApi";
import { useAppDispatch } from "../../app/hooks";
import { setUser } from "./authSlice";
import formStyles from "../../components/form.module.css";

/* ─────────── Validation ─────────── */
const LoginSchema = Yup.object({
  email:    Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Too short").required("Required"),
});

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const getRedirect = (user) => {
    const from = location.state?.from?.pathname;
    if (from) return from;
    return user.role === "admin" ? "/admin/products" : "/";
  };

  return (
    <main className="container" style={{ maxWidth: 420, paddingTop: "2rem" }}>
      <h1>Login</h1>

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting, setFieldError }) => {
          try {
            const { user } = await login(values).unwrap();
            dispatch(setUser(user));
            navigate(getRedirect(user), { replace: true });
          } catch (err) {
            setFieldError("email", err?.data?.message || "Login failed");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className={formStyles.form}>
            {/* Email */}
            <div className={formStyles.field}>
              <label htmlFor="email">Email</label>
              <Field id="email" name="email" type="email" />
              <ErrorMessage name="email" component="span" style={{ color: "red" }} />
            </div>

            {/* Password */}
            <div className={formStyles.field}>
              <label htmlFor="password">Password</label>
              <Field id="password" name="password" type="password" />
              <ErrorMessage name="password" component="span" style={{ color: "red" }} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              style={{
                padding: ".65rem 1rem",
                background: "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {isLoading ? "Logging in…" : "Login"}
            </button>
          </Form>
        )}
      </Formik>

      {/* ─────────── Demo credentials / CTA (now **below** the form) ─────────── */}
      <div
        style={{
          background: "#f8f9ff",
          border: "1px solid #d0d7ff",
          borderRadius: 8,
          padding: "1rem 1.25rem",
          marginTop: "2rem",
          fontSize: 14,
          lineHeight: 1.45,
        }}
      >
        <h3 style={{ margin: "0 0 .5rem 0" }}>Demo credentials</h3>
        <p style={{ margin: 0 }}>
          Admin&nbsp;dashboard:&nbsp;
          <code>user@gmail.com</code> / <code> PASSWORD : user1user1</code>
        </p>
        <hr style={{ margin: ".75rem 0" }} />
        <p style={{ margin: 0 }}>
          No account yet? <Link to="/register">Register here</Link>
        </p>
      </div>
    </main>
  );
}