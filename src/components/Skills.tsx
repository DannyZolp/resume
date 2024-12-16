import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
import { ActionIcon, Grid, Group, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../state/AuthState";
import { IconTrash } from "@tabler/icons-react";

type SkillsProps = {
  supabase: SupabaseClient<Database>;
};

export const Skills = ({ supabase }: SkillsProps) => {
  const auth = useAuth();
  const [skills, setSkills] = useState<
    Database["public"]["Tables"]["skills"]["Row"][]
  >([]);
  const [deleting, setDeleting] = useState<number>(-1);

  useEffect(() => {
    supabase
      .from("skills")
      .select("*")
      .eq("user_id", auth.userId)
      .order("started_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setSkills(data);
        }
      });
  }, []);

  return (
    <Stack>
      {skills.map((skill, index) => (
        <Grid gutter="xs" key={index}>
          <Grid.Col span="auto">
            <Group grow mt="sm">
              <Text fw={700}>{skill.name}</Text>
              <Text ta="end" c="dimmed">
                {formatDistanceToNow(skill.started_at)}
              </Text>
            </Group>
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
                  .from("skills")
                  .delete()
                  .eq("id", skill.id)
                  .then(() => {
                    setSkills(skills.filter((j) => j.id !== skill.id));
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
