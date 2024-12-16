import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
import { Modal, TextInput, Group, Button, Checkbox } from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { useState } from "react";

type AddSkillModalProps = {
  close: () => void;
  opened: boolean;
  supabase: SupabaseClient<Database>;
};

export const AddSkillModal = ({
  close,
  opened,
  supabase
}: AddSkillModalProps) => {
  const [name, setName] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [isHobby, setIsHobby] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const createSkill = () => {
    setLoading(true);
    supabase
      .from("skills")
      .insert({
        name,
        started_at: startDate?.toISOString() ?? "",
        is_hobby: isHobby
      })
      .then(() => {
        setName("");
        setStartDate(null);
        setIsHobby(false);
        setLoading(false);
        close();
      });
  };

  return (
    <Modal opened={opened} onClose={close} title="Add Skill">
      <form>
        <TextInput
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        ></TextInput>

        <MonthPickerInput
          label="Started"
          value={startDate}
          onChange={(date) => setStartDate(date)}
          maxDate={new Date()}
        ></MonthPickerInput>

        <Checkbox
          mt="sm"
          label="Is this skill a hobby?"
          onChange={() => setIsHobby(!isHobby)}
          defaultChecked={isHobby}
        ></Checkbox>

        <Group justify="flex-end" mt="sm">
          <Button loading={loading} onClick={createSkill}>
            Create
          </Button>
        </Group>
      </form>
    </Modal>
  );
};
