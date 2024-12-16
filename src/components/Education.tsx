import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
import { useEffect, useState } from "react";
import { ActionIcon, Grid, Group, Stack, Text } from "@mantine/core";
import { format } from "date-fns";
import { useAuth } from "../state/AuthState";
import { IconTrash } from "@tabler/icons-react";

type EducationProps = {
  supabase: SupabaseClient<Database>;
};

export const Education = ({ supabase }: EducationProps) => {
  const auth = useAuth();

  const [education, setEducation] = useState<
    Database["public"]["Tables"]["education"]["Row"][]
  >([]);
  const [deleting, setDeleting] = useState<number>(-1);

  useEffect(() => {
    supabase
      .from("education")
      .select("*")
      .eq("user_id", auth.userId)
      .order("started_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setEducation(data);
        }
      });
  }, []);

  return (
    <Stack>
      {education.map((edu, index) => (
        <Grid gutter="xs" key={index}>
          <Grid.Col span="auto">
            <Stack gap={0} mt="xs">
              <Group grow>
                <Text fw={700} m={0}>
                  {edu.institution}
                </Text>
                <Text m={0} c="dimmed" ta="end">
                  {format(edu.started_at, "MMM yyyy")} -{" "}
                  {edu.ended_at
                    ? format(edu.ended_at, "MMM yyyy")
                    : "Expected " +
                      format(edu?.expected_graduation ?? "", "MMM yyyy")}
                </Text>
              </Group>
              <Text size="sm">{edu.location}</Text>
              <Text>{edu.degree}</Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span="content">
            <ActionIcon
              variant="transparent"
              color="red"
              size="sm"
              mt="xs"
              disabled={deleting > -1}
              loading={deleting === index}
              onClick={() => {
                setDeleting(index);
                supabase
                  .from("education")
                  .delete()
                  .eq("id", edu.id)
                  .then(() => {
                    setEducation(education.filter((j) => j.id !== edu.id));
                    setDeleting(-1);
                  });
              }}
            >
              <IconTrash />
            </ActionIcon>
          </Grid.Col>
        </Grid>
      ))}
    </Stack>
  );
};
