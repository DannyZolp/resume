import { Button, Container, Group, Input, Title } from "@mantine/core";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { isEmail, isMobilePhone, normalizeEmail } from "validator";
import { Database } from "../types/supabase";
import { phone } from "phone";
import { useAuth } from "../state/AuthState";

enum ESetupState {
  NAME,
  LOCATION,
  EMAIL,
  PHONE_NUMBER,
  DONE
}

type SetupBasicsProps = {
  supabase: SupabaseClient<Database>;
};

export function SetupBasics({ supabase }: SetupBasicsProps) {
  const auth = useAuth();

  const [state, setState] = useState<ESetupState>(ESetupState.NAME);

  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  useEffect(() => {
    if (state === ESetupState.DONE) {
      supabase
        .from("profiles")
        .insert({
          name: name,
          location: location,
          email: normalizeEmail(email).toString(),
          phone_number: phone(phoneNumber).phoneNumber,
          user_id: auth.userId
        })
        .then(() => {});
    }
  }, [state]);

  if (state === ESetupState.NAME) {
    return (
      <Container style={{ height: "80vh", alignContent: "center" }}>
        <Title size="4rem">First, what's your full name?</Title>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setState(ESetupState.LOCATION);
          }}
        >
          <Input
            mt="lg"
            size="xl"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Smith"
          ></Input>

          <Group justify="flex-end">
            <Button mt="sm" size="lg" type="submit" disabled={name.length < 5}>
              Next
            </Button>
          </Group>
        </form>
      </Container>
    );
  }

  if (state === ESetupState.LOCATION) {
    return (
      <Container style={{ height: "80vh", alignContent: "center" }}>
        <Title size="4rem">What city will you be working in?</Title>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setState(ESetupState.EMAIL);
          }}
        >
          <Input
            mt="lg"
            size="xl"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Milwaukee, WI"
          ></Input>

          <Group justify="flex-end">
            <Button
              mt="sm"
              size="lg"
              type="submit"
              disabled={location.length < 5}
            >
              Next
            </Button>
          </Group>
        </form>
      </Container>
    );
  }

  if (state === ESetupState.EMAIL) {
    return (
      <Container style={{ height: "80vh", alignContent: "center" }}>
        <Title size="4rem">What is your professional email address?</Title>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setState(ESetupState.PHONE_NUMBER);
          }}
        >
          <Input
            mt="lg"
            size="xl"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john.smith@example.com"
          ></Input>

          <Group justify="flex-end">
            <Button mt="sm" size="lg" type="submit" disabled={!isEmail(email)}>
              Next
            </Button>
          </Group>
        </form>
      </Container>
    );
  }

  if (state === ESetupState.PHONE_NUMBER) {
    return (
      <Container style={{ height: "80vh", alignContent: "center" }}>
        <Title size="4rem">What's your phone number?</Title>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setState(ESetupState.DONE);
          }}
        >
          <Input
            mt="lg"
            size="xl"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1 (778) 330-2389"
          ></Input>

          <Group justify="flex-end">
            <Button
              mt="sm"
              size="lg"
              type="submit"
              disabled={!isMobilePhone(phoneNumber)}
            >
              Next
            </Button>
          </Group>
        </form>
      </Container>
    );
  }
}
