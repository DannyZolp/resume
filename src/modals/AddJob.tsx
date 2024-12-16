import {
  Button,
  Checkbox,
  Fieldset,
  Grid,
  Group,
  Modal,
  Stack,
  TextInput
} from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { useState } from "react";
import { IconMinus } from "@tabler/icons-react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

type AddJobModalProps = {
  close: () => void;
  opened: boolean;
  supabase: SupabaseClient<Database>;
};

export const AddJobModal = ({ opened, close, supabase }: AddJobModalProps) => {
  const [position, setPosition] = useState<string>("");
  const [organization, setOrganization] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentlyWorking, setCurrentlyWorking] = useState<boolean>(false);

  const [roles, setRoles] = useState<string[]>([""]);

  const [loading, setLoading] = useState<boolean>(false);

  const createJob = () => {
    setLoading(true);
    supabase
      .from("jobs")
      .insert({
        position,
        organization,
        location,
        started_at: startDate?.toISOString() ?? "",
        ended_at: currentlyWorking ? null : endDate?.toDateString(),
        roles
      })
      .then(() => {
        setPosition("");
        setOrganization("");
        setLocation("");
        setStartDate(null);
        setEndDate(null);
        setCurrentlyWorking(false);
        setRoles([""]);
        setLoading(false);
        close();
      });
  };

  return (
    <Modal opened={opened} onClose={close} title="Add Job">
      <form>
        <Fieldset legend="Basic Information">
          <TextInput
            label="Position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          ></TextInput>
          <TextInput
            label="Organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          ></TextInput>
          <TextInput
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          ></TextInput>

          <Grid>
            <Grid.Col span={6}>
              <MonthPickerInput
                label="Started"
                value={startDate}
                onChange={(date) => setStartDate(date)}
                maxDate={endDate ?? new Date()}
              ></MonthPickerInput>
            </Grid.Col>
            <Grid.Col span={6}>
              <MonthPickerInput
                label="End Date"
                disabled={currentlyWorking}
                value={currentlyWorking ? new Date() : endDate}
                onChange={(date) => setEndDate(date)}
                minDate={startDate ?? new Date()}
                maxDate={new Date()}
              ></MonthPickerInput>
              <Checkbox
                mt="sm"
                label="Currently Employed"
                onClick={() => setCurrentlyWorking(!currentlyWorking)}
                defaultChecked={currentlyWorking}
              ></Checkbox>
            </Grid.Col>
          </Grid>
        </Fieldset>
      </form>

      <Fieldset legend="Roles and Accomplishments" mt="md">
        {/* <Text size="xs">
          Create a list of all of your accomplishments, what roles you served
          for the company, and anything else that might be important for someone
          reading to know.
        </Text> */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setRoles([...roles, ""]);
          }}
        >
          <Stack>
            {roles.map((role, index) => (
              <TextInput
                leftSection={
                  <IconMinus
                    size={16}
                    cursor={roles.length === 1 ? "not-allowed" : "pointer"}
                    onClick={() => {
                      if (roles.length > 1) {
                        const newRoles = [...roles];
                        newRoles.splice(index, 1);
                        setRoles(newRoles);
                      }
                    }}
                  />
                }
                value={role}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setRoles([...roles, ""]);
                  } else if (e.key === "Backspace") {
                    if (role === "" && roles.length > 1) {
                      const newRoles = [...roles];
                      newRoles.splice(index, 1);
                      setRoles(newRoles);
                    }
                  }
                }}
                onChange={(e) => {
                  const newRoles = [...roles];
                  newRoles[index] = e.currentTarget.value;
                  setRoles(newRoles);
                }}
                placeholder="Enter role or accomplishment"
              ></TextInput>
            ))}
          </Stack>
        </form>
      </Fieldset>
      <Group justify="flex-end" mt="sm">
        <Button loading={loading} onClick={createJob}>
          Create
        </Button>
      </Group>
    </Modal>
  );
};
