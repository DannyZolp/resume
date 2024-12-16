import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
import {
  Button,
  Container,
  Group,
  PasswordInput,
  TextInput,
  Title
} from "@mantine/core";
import { FormEvent, useState } from "react";
import isEmail from "validator/lib/isEmail";
import { useAuth } from "../state/AuthState.ts";

type LoginProps = {
  supabase: SupabaseClient<Database>;
};

export function Login({ supabase }: LoginProps) {
  const auth = useAuth();

  const [signup, setSignup] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    supabase.auth
      .signInWithPassword({
        email: email,
        password: password
      })
      .then(({ data }) => {
        if (data.user !== null) {
          auth.login(data.user?.id ?? "");
        }
      });
  };

  const handleSignup = (e: FormEvent) => {
    e.preventDefault();
    supabase.auth
      .signUp({
        email: email,
        password: password
      })
      .then(({ data }) => {
        if (data.user !== null) {
          auth.login(data.user?.id ?? "");
        }
      });
  };

  return (
    <Container style={{ height: "80vh", alignContent: "center" }}>
      <Title size="4rem">{signup ? "Signup" : "Login"}</Title>
      <form onSubmit={signup ? handleSignup : handleLogin}>
        <TextInput
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          label="Email"
          mt="lg"
          size="xl"
          type="email"
          placeholder="john.smith@example.com"
        ></TextInput>
        <PasswordInput
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          label="Password"
          mt="lg"
          size="xl"
        ></PasswordInput>
        {signup ? (
          <PasswordInput
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
            error={
              password === confirmPassword ? undefined : "Passwords must match."
            }
            label="Confirm Password"
            mt="lg"
            size="xl"
          ></PasswordInput>
        ) : null}
        <Group justify="flex-end">
          <Button
            mt="sm"
            size="lg"
            onClick={() => setSignup(!signup)}
            variant="outline"
          >
            {signup ? "Login" : "Signup"}
          </Button>
          <Button
            mt="sm"
            size="lg"
            type="submit"
            disabled={
              !isEmail(email) ||
              password.length < 8 ||
              (signup ? password !== confirmPassword : false)
            }
          >
            Next
          </Button>
        </Group>
      </form>
    </Container>
  );
}
