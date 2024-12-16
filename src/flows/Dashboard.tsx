import {
  Avatar,
  Button,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  Title
} from "@mantine/core";
import { useAuth } from "../state/AuthState";
import { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
import { UserProfile } from "../types/UserProfile";
import { AddJobModal } from "../modals/AddJob";
import { Jobs } from "../components/Jobs";
import { AddEducationModal } from "../modals/AddEducation";
import { Education } from "../components/Education";
import { AddSkillModal } from "../modals/AddSkill";
import { Skills } from "../components/Skills";
import { useHotkeys } from "@mantine/hooks";
import { ExportResumeModal } from "../modals/ExportResume";
import { Research } from "../components/Research";
import { AddResearchModal } from "../modals/AddResearch";

type DashboardProps = {
  supabase: SupabaseClient<Database>;
};

export function Dashboard({ supabase }: DashboardProps) {
  const auth = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [addJobModal, setAddJobModal] = useState<boolean>(false);
  const [addEducationModal, setAddEducationModal] = useState<boolean>(false);
  const [addResearchModal, setAddResearchModal] = useState<boolean>(false);
  const [addSkillModal, setAddSkillModal] = useState<boolean>(false);
  const [exportResumeModal, setExportResumeModal] = useState<boolean>(false);

  useHotkeys([["mod+p", () => setExportResumeModal(true)]]);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", auth.userId)
      .then(({ data }) => {
        if (data) {
          setProfile({
            name: data[0].name,
            email: data[0].email ?? "",
            phoneNumber: data[0].phone_number ?? "",
            location: data[0].location
          });
        }
      });
  }, [auth.userId]);

  return (
    <>
      <AddJobModal
        opened={addJobModal}
        close={() => setAddJobModal(false)}
        supabase={supabase}
      />
      <AddEducationModal
        opened={addEducationModal}
        close={() => setAddEducationModal(false)}
        supabase={supabase}
      />
      <AddResearchModal
        opened={addResearchModal}
        close={() => setAddResearchModal(false)}
        supabase={supabase}
      />
      <AddSkillModal
        opened={addSkillModal}
        close={() => setAddSkillModal(false)}
        supabase={supabase}
      />
      <ExportResumeModal
        opened={exportResumeModal}
        close={() => setExportResumeModal(false)}
        supabase={supabase}
      />

      <Container>
        <Group mt="xl">
          <Avatar src="" size="200px" />

          <Stack>
            <Title>{profile?.name}</Title>
            <Text>Located in {profile?.location}</Text>
            <Text>{profile?.email}</Text>
            <Text>{profile?.phoneNumber}</Text>
          </Stack>
        </Group>

        <Divider my="lg" />

        <Group grow>
          <Text size="xl">Jobs</Text>
          <Group justify="flex-end">
            <Button size="sm" onClick={() => setAddJobModal(true)}>
              Add More
            </Button>
          </Group>
        </Group>

        <Jobs supabase={supabase} />

        {/* Education */}

        <Group grow mt="md">
          <Text size="xl">Education</Text>
          <Group justify="flex-end">
            <Button size="sm" onClick={() => setAddEducationModal(true)}>
              Add More
            </Button>
          </Group>
        </Group>

        <Education supabase={supabase} />

        {/* Research */}

        <Group grow mt="md">
          <Text size="xl">Research</Text>
          <Group justify="flex-end">
            <Button size="sm" onClick={() => setAddResearchModal(true)}>
              Add More
            </Button>
          </Group>
        </Group>

        <Research supabase={supabase} />

        {/* Skills */}

        <Group grow mt="md">
          <Text size="xl">Skills</Text>
          <Group justify="flex-end">
            <Button size="sm" onClick={() => setAddSkillModal(true)}>
              Add More
            </Button>
          </Group>
        </Group>

        <Skills supabase={supabase} />
      </Container>
    </>
  );
}
