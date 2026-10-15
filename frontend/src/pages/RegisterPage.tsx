import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link as RouterLink } from "react-router";
import { Alert, Button, Link, Stack, TextField, Typography } from "@mui/material";
import { ApiError } from "../api/client";
import { AuthCard } from "../components/AuthCard";
import { useAuth } from "../hooks/useAuth";

const MIN_PASSWORD_LENGTH = 8;

export function RegisterPage() {
  const { register } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** One change handler for every field, using the input's name attribute. */
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  /** Quick checks in the browser, so obvious mistakes are caught before calling the server. */
  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (form.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
    if (!form.email.trim()) errors.email = "Email is required";
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }
    if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords do not match";
    return errors;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      // No navigate() here: once the user is set, GuestRoute moves them to their dashboard.
      await register({ name: form.name, email: form.email, password: form.password });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start tracking expenses and budgets"
      footer={
        <Typography variant="body2">
          Already have an account?{" "}
          <Link component={RouterLink} to="/login">
            Sign in
          </Link>
        </Typography>
      }
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit} noValidate>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Name"
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          error={Boolean(fieldErrors.name)}
          helperText={fieldErrors.name}
          required
          autoFocus
          fullWidth
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={Boolean(fieldErrors.email)}
          helperText={fieldErrors.email}
          required
          fullWidth
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          error={Boolean(fieldErrors.password)}
          helperText={fieldErrors.password ?? `At least ${MIN_PASSWORD_LENGTH} characters`}
          required
          fullWidth
        />
        <TextField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={Boolean(fieldErrors.confirmPassword)}
          helperText={fieldErrors.confirmPassword}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </Stack>
    </AuthCard>
  );
}
