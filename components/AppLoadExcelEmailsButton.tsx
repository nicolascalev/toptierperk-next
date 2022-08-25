import { useState, useEffect } from "react";
import { FileButton, Button, Group, Text } from "@mantine/core";
import { uniq } from "lodash";
import readXlsxFile from "read-excel-file";

const isEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

type Props = {
  onRead: (emails: string[]) => void;
  processing: boolean;
}

function AppLoadExcelEmailsButton({ onRead, processing }: Props) {
  const [loading, setLoading] = useState(false);

  function onChangeFile(file: File | null) {
    if (!file) return
    setLoading(true);
    readXlsxFile(file).then((rows: any) => {
      const list: string[] = uniq(rows.map((row: string[]) => row[0]));
      const emailList = list.filter((item:string) => isEmail(item));
      setLoading(false);
      onRead(emailList);
    });
  }

  return (
    <>
      <FileButton
        onChange={onChangeFile}
        accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      >
        {(props) => (
          <Button fullWidth loading={loading || processing} {...props}>
            Load from excel
          </Button>
        )}
      </FileButton>
      <Text size="xs" color="dimmed">
        The excel should contain emails on the first column only
      </Text>
    </>
  );
}

export default AppLoadExcelEmailsButton;
