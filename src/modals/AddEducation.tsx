import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
import { Button, Checkbox, Grid, Group, Modal, TextInput } from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { useState } from "react";

type AddEducationModalProps = {
  close: () => void;
  opened: boolean;
  supabase: SupabaseClient<Database>;
};

export const AddEducationModal = ({
  opened,
  close,
  supabase
}: AddEducationModalProps) => {
  const [institution, setInstitution] = useState<string>("");
  const [degree, setDegree] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentlyWorking, setCurrentlyWorking] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const createEducation = () => {
    setLoading(true);
    supabase
      .from("education")
      .insert({
        institution,
        degree,
        location,
        started_at: startDate?.toISOString() ?? "",
        ended_at: currentlyWorking ? null : endDate?.toISOString(),
        expected_graduation: currentlyWorking ? endDate?.toISOString() : null
      })
      .then(() => {
        setInstitution("");
        setDegree("");
        setStartDate(null);
        setEndDate(null);
        setCurrentlyWorking(false);
        setLoading(false);
        close();
      });
  };

  return (
    <Modal opened={opened} onClose={close} title="Add Education">
      <form>
        <TextInput
          label="Institution"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
        ></TextInput>
        <TextInput
          label="Degree"
          value={degree}
          onChange={(e) => setDegree(e.target.value)}
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
              label={!currentlyWorking ? "Graduated" : "Expected Graduation"}
              value={endDate}
              onChange={(date) => setEndDate(date)}
              minDate={startDate ?? new Date()}
              maxDate={!currentlyWorking ? new Date() : undefined}
            ></MonthPickerInput>
            <Checkbox
              mt="sm"
              label="Currently Enrolled"
              onClick={() => setCurrentlyWorking(!currentlyWorking)}
              defaultChecked={currentlyWorking}
            ></Checkbox>
          </Grid.Col>
        </Grid>
        <Group justify="flex-end" mt="sm">
          <Button loading={loading} onClick={createEducation}>
            Create
          </Button>
        </Group>
      </form>
    </Modal>
  );
};
