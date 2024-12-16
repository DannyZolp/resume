import "./print.css";

import { useEffect } from "react";
import { IResume } from "../types/Resume";
import { format } from "date-fns";

type GenericResumeProps = {
  resume: IResume;
  scale?: number;
  autoPrint?: boolean;
};

function getScaleFunction(scale?: number) {
  return (value: number) => value * (scale ?? 1) + "in";
}

export function GenericResume({
  resume,
  scale: scaleValue,
  autoPrint
}: GenericResumeProps) {
  const scale = getScaleFunction(scaleValue);

  useEffect(() => {
    if (autoPrint) {
      window.print();
    }
  }, []);

  return (
    <main
      style={{
        height: scale(11),
        width: scale(8.5),
        padding: scale(0.5),
        border: autoPrint ? "none" : "1px solid black"
      }}
    >
      <header>
        <h1
          style={{
            fontSize: scale(0.3),
            marginTop: 0,
            marginBottom: scale(0.05)
          }}
        >
          {resume.name}
        </h1>
        <p
          style={{
            fontSize: scale(0.15),
            margin: 0
          }}
        >
          {resume.email}
        </p>
        <p
          style={{
            fontSize: scale(0.15),
            margin: 0
          }}
        >
          {resume.phone}
        </p>
        <p
          style={{
            fontSize: scale(0.15),
            margin: 0
          }}
        >
          {resume.location}
        </p>
      </header>

      <hr />

      {resume.jobs.length > 0 ? (
        <section>
          <h2 style={{ fontSize: scale(0.2) }}>Work Experience</h2>
          {resume.jobs.map((job, index) => (
            <div key={index}>
              <h3 style={{ fontSize: scale(0.15) }}>
                {job.position} at {job.organization}
              </h3>
              <p style={{ fontSize: scale(0.15) }}>
                {format(job.start, "MMM yyyy")} -{" "}
                {job.end ? format(job.end, "MMM yyyy") : "Present"}
              </p>
              <ul>
                {job.roles.map((role, index) => (
                  <li key={index} style={{ fontSize: scale(0.15) }}>
                    {role}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}

      {resume.education.length > 0 ? (
        <section>
          <h2 style={{ fontSize: scale(0.2) }}>Education</h2>
          {resume.education.map((education, index) => (
            <div key={index}>
              <h3 style={{ fontSize: scale(0.15) }}>
                {education.degree} at {education.institution}
              </h3>
              <p style={{ fontSize: scale(0.15) }}>
                {format(education.start, "MMM yyyy")} -{" "}
                {education.end ? format(education.end, "MMM yyyy") : "Present"}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      {resume.research.length > 0 ? (
        <section>
          <h2 style={{ fontSize: scale(0.2) }}>Research</h2>
          {resume.research.map((research, index) => (
            <div key={index}>
              <h3 style={{ fontSize: scale(0.15) }}>
                {research.topic} at {research.institution}
              </h3>
              <p style={{ fontSize: scale(0.15) }}>
                {format(research.start, "MMM yyyy")} -{" "}
                {research.end ? format(research.end, "MMM yyyy") : "Present"}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      {resume.skills.length > 0 ? (
        <section>
          <h2 style={{ fontSize: scale(0.2) }}>Skills</h2>
          <ul>
            {resume.skills.map((skill, index) => (
              <li key={index} style={{ fontSize: scale(0.15) }}>
                {skill.name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
