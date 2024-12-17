import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Group,
  Modal,
  Text,
  Textarea
} from "@mantine/core";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../state/AuthState";
import leven from "leven";
import { GenericResume } from "../resume-templates/generic";

type ExportResumeModalProps = {
  opened: boolean;
  close: () => void;
  supabase: SupabaseClient<Database>;
};

export const ExportResumeModal = ({
  opened,
  close,
  supabase
}: ExportResumeModalProps) => {
  const auth = useAuth();

  const [state, setState] = useState<"ai" | "view">("ai");

  const [jobDescription, setJobDescription] = useState<string>("");

  const [profile, setProfile] =
    useState<Database["public"]["Tables"]["profiles"]["Row"]>();
  const [jobs, setJobs] = useState<
    Database["public"]["Tables"]["jobs"]["Row"][]
  >([]);
  const [skills, setSkills] = useState<
    Database["public"]["Tables"]["skills"]["Row"][]
  >([]);
  const [education, setEducation] = useState<
    Database["public"]["Tables"]["education"]["Row"][]
  >([]);
  const [research, setResearch] = useState<
    Database["public"]["Tables"]["research"]["Row"][]
  >([]);

  const [recommendedJobs, setRecommendedJobs] = useState<string[]>([]);
  const [recommendedSkills, setRecommendedSkills] = useState<string[]>([]);
  const [recommendedEducation, setRecommendedEducation] = useState<string[]>(
    []
  );
  const [recommendedResearch, setRecommendedResearch] = useState<string[]>([]);
  const [loadingRecommendation, setLoadingRecommendation] =
    useState<boolean>(false);

  const resumeData = {
    name: profile?.name ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone_number ?? "",
    location: profile?.location ?? "",
    skills: skills
      .filter((s) => recommendedSkills.includes(s.id))
      .map((s) => ({
        name: s.name ?? "",
        is_hobby: s.is_hobby,
        start: new Date(s.created_at)
      })),
    jobs: jobs
      .filter((j) => recommendedJobs.includes(j.id))
      .map((j) => ({
        organization: j.organization,
        position: j.position,
        roles: j.roles,
        location: j.location,
        start: new Date(j.started_at),
        end: j.ended_at ? new Date(j.ended_at) : undefined
      })),
    education: education
      .filter((e) => recommendedEducation.includes(e.id))
      .map((e) => ({
        degree: e?.degree ?? "",
        institution: e.institution,
        location: e?.location ?? "",
        start: new Date(e.started_at),
        end: e.ended_at ? new Date(e.ended_at) : undefined
      })),
    research: research
      .filter((r) => recommendedResearch.includes(r.id))
      .map((r) => ({
        topic: r.topic,
        institution: r.institution,
        start: new Date(r.started_at),
        end: r.ended_at ? new Date(r.ended_at) : undefined,
        points: r.points
      }))
  };

  useEffect(() => {
    supabase
      .from("jobs")
      .select("*")
      .eq("user_id", auth.userId)
      .then(({ data }) => {
        if (data) {
          setJobs(data);
        }
      });

    supabase
      .from("skills")
      .select("*")
      .eq("user_id", auth.userId)
      .then(({ data }) => {
        if (data) {
          setSkills(data);
        }
      });

    supabase
      .from("education")
      .select("*")
      .eq("user_id", auth.userId)
      .then(({ data }) => {
        if (data) {
          setEducation(data);
        }
      });

    supabase
      .from("research")
      .select("*")
      .eq("user_id", auth.userId)
      .then(({ data }) => {
        if (data) {
          setResearch(data);
        }
      });

    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", auth.userId)
      .then(({ data }) => {
        if (data) {
          setProfile(data[0]);
        }
      });
  }, []);

  const getAIRecommendation = (e: FormEvent) => {
    e.preventDefault();
    setLoadingRecommendation(true);

    supabase.functions
      .invoke("resume-ai", {
        body: { description: jobDescription }
      })
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
        } else {
          const recommendedJobsTemp = [];
          for (const job of data.jobs) {
            recommendedJobsTemp.push(
              jobs.sort((j) => leven(j.organization, job))[0].id
            );
          }
          setRecommendedJobs(recommendedJobsTemp);

          const recommendedSkillsTemp = [];
          for (const skill of data.skills) {
            recommendedSkillsTemp.push(
              skills.sort((s) => leven(s.name ?? "", skill))[0].id
            );
          }
          setRecommendedSkills(recommendedSkillsTemp);

          const recommendedEducationTemp = [];
          for (const edu of data.education) {
            recommendedEducationTemp.push(
              education.sort((e) => leven(e.institution, edu))[0].id
            );
          }
          setRecommendedEducation(recommendedEducationTemp);

          const recommendedResearchTemp = [];
          for (const res of data.research) {
            recommendedResearchTemp.push(
              research.sort((r) => leven(r.topic, res))[0].id
            );
          }
          setRecommendedResearch(recommendedResearchTemp);

          setLoadingRecommendation(false);
          setState("view");
        }
      });
  };

  return (
    <Modal opened={opened} onClose={close} title="Export Resume" size="auto">
      {state === "ai" ? (
        <form onSubmit={getAIRecommendation}>
          <Textarea
            label="Job Description"
            description="Copy and paste any given information from the application that you think would be helpful for the AI to curate your resume to."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          ></Textarea>
          <Group justify="end">
            <Button
              disabled={loadingRecommendation}
              color="gray"
              type="button"
              onClick={() => {
                setState("view");
              }}
            >
              Skip
            </Button>
            <Button type="submit" loading={loadingRecommendation}>
              Next
            </Button>
          </Group>
        </form>
      ) : null}
      {state === "view" ? (
        <Grid>
          <Grid.Col span={"content"}>
            <GenericResume scale={0.5} resume={resumeData} />
          </Grid.Col>
          <Grid.Col span={"auto"}>
            <Text>Jobs</Text>
            {jobs.map((j) => (
              <Checkbox
                mt="xs"
                key={j.id}
                label={j.position + " at " + j.organization}
                checked={recommendedJobs.includes(j.id)}
                onChange={() => {
                  setRecommendedJobs(
                    recommendedJobs.includes(j.id)
                      ? recommendedJobs.filter((id) => id !== j.id)
                      : [...recommendedJobs, j.id]
                  );
                }}
              ></Checkbox>
            ))}

            <Divider my="sm" />

            <Text>Education</Text>
            {education.map((e) => (
              <Checkbox
                mt="xs"
                key={e.id}
                label={e.institution}
                checked={recommendedEducation.includes(e.id)}
                onChange={() => {
                  setRecommendedEducation(
                    recommendedEducation.includes(e.id)
                      ? recommendedEducation.filter((id) => id !== e.id)
                      : [...recommendedEducation, e.id]
                  );
                }}
              ></Checkbox>
            ))}

            <Divider my="sm" />
            <Text>Research</Text>
            {research.map((e) => (
              <Checkbox
                mt="xs"
                key={e.id}
                label={e.topic + " at " + e.institution}
                checked={recommendedResearch.includes(e.id)}
                onChange={() => {
                  setRecommendedResearch(
                    recommendedResearch.includes(e.id)
                      ? recommendedResearch.filter((id) => id !== e.id)
                      : [...recommendedResearch, e.id]
                  );
                }}
              ></Checkbox>
            ))}

            <Divider my="sm" />

            <Text>Skills</Text>
            {skills.map((s) => (
              <Checkbox
                mt="xs"
                key={s.id}
                label={s.name}
                checked={recommendedSkills.includes(s.id)}
                onChange={() => {
                  setRecommendedSkills(
                    recommendedSkills.includes(s.id)
                      ? recommendedSkills.filter((id) => id !== s.id)
                      : [...recommendedSkills, s.id]
                  );
                }}
              ></Checkbox>
            ))}

            <Group justify="end" mt="xl">
              <Button
                onClick={() => {
                  const query = new URLSearchParams({
                    resume: "generic",
                    data: JSON.stringify(resumeData)
                  });
                  window.open("/?" + query.toString());
                }}
              >
                Print
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      ) : null}
    </Modal>
  );
};
