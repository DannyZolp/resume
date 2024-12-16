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

type AddResearchModalProps = {
  close: () => void;
  opened: boolean;
  supabase: SupabaseClient<Database>;
};

export const AddResearchModal = ({
  opened,
  close,
  supabase
}: AddResearchModalProps) => {
  const [topic, setTopic] = useState<string>("");
  const [institution, setInstitution] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentlyResearching, setCurrentlyResearching] =
    useState<boolean>(false);

  const [points, setPoints] = useState<string[]>([""]);

  const [loading, setLoading] = useState<boolean>(false);

  const createResearch = () => {
    setLoading(true);
    supabase
      .from("research")
      .insert({
        topic,
        institution,
        started_at: startDate?.toISOString() ?? "",
        ended_at: currentlyResearching ? null : endDate?.toISOString(),
        points
      })
      .then(() => {
        setTopic("");
        setInstitution("");
        setStartDate(null);
        setEndDate(null);
        setCurrentlyResearching(false);
        setPoints([""]);
        setLoading(false);
        close();
      });
  };

  return (
    <Modal opened={opened} onClose={close} title="Add Research">
      <form>
        <Fieldset legend="Basic Information">
          <TextInput
            label="Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          ></TextInput>
          <TextInput
            label="Institution"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
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
                disabled={currentlyResearching}
                value={currentlyResearching ? new Date() : endDate}
                onChange={(date) => setEndDate(date)}
                minDate={startDate ?? new Date()}
                maxDate={new Date()}
              ></MonthPickerInput>
              <Checkbox
                mt="sm"
                label="Currently Employed"
                onClick={() => setCurrentlyResearching(!currentlyResearching)}
                checked={currentlyResearching}
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
            setPoints([...points, ""]);
          }}
        >
          <Stack>
            {points.map((point, index) => (
              <TextInput
                leftSection={
                  <IconMinus
                    size={16}
                    cursor={points.length === 1 ? "not-allowed" : "pointer"}
                    onClick={() => {
                      if (points.length > 1) {
                        const newRoles = [...points];
                        newRoles.splice(index, 1);
                        setPoints(newRoles);
                      }
                    }}
                  />
                }
                value={point}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setPoints([...points, ""]);
                  } else if (e.key === "Backspace") {
                    if (point === "" && points.length > 1) {
                      const newRoles = [...points];
                      newRoles.splice(index, 1);
                      setPoints(newRoles);
                    }
                  }
                }}
                onChange={(e) => {
                  const newRoles = [...points];
                  newRoles[index] = e.currentTarget.value;
                  setPoints(newRoles);
                }}
                placeholder="Enter role or accomplishment"
              ></TextInput>
            ))}
          </Stack>
        </form>
      </Fieldset>
      <Group justify="flex-end" mt="sm">
        <Button loading={loading} onClick={createResearch}>
          Create
        </Button>
      </Group>
    </Modal>
  );
};
