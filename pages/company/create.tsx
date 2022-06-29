import { useState } from "react"
import type { NextPage } from "next";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useMantineTheme } from "@mantine/core";
import AppCompanyForm from "../../components/AppCompanyForm";
import confetti from "canvas-confetti"

interface Props {
  user: any;
}

const CompanyCreate: NextPage<Props> = ({ user }) => {
  const theme = useMantineTheme();

  function handleOnSuccess() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  function handleOnError(error: any) {
    console.log(error)
    // TODO: tell user
  }

  return (
    <div style={{ marginBottom: "49px", padding: theme.spacing.md  }}>
      <h2>Create Company</h2>
      <AppCompanyForm action="create" onSuccess={handleOnSuccess} onError={error => handleOnError(error)}></AppCompanyForm>
    </div>
  )
}

export default CompanyCreate;

export const getServerSideProps = withPageAuthRequired();