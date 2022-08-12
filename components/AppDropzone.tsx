import { Group, Text, useMantineTheme } from '@mantine/core';
import { Upload, Photo, X, Icon as TablerIcon } from 'tabler-icons-react';
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from '@mantine/dropzone';

export default function AppDropzone(props: Partial<DropzoneProps>) {
  const theme = useMantineTheme();
  return (
    <Dropzone
      onDrop={(files) => console.log('accepted files', files)}
      onReject={(files) => console.log('rejected files', files)}
      maxSize={4 * 1024 ** 2}
      accept={["image/*"]}
      {...props}
    >
      <Group position="center" spacing="xs" style={{ minHeight: 100, pointerEvents: 'none' }}>
        <Dropzone.Accept>
          <Upload
            size={50}
            color={theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]}
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <X
            size={50}
            color={theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <Photo size={50} />
        </Dropzone.Idle>

        <div>
          <Text size="lg" inline>
            Drag images here or click to select files
          </Text>
          <Text size="sm" color="dimmed" inline mt="md">
            Attach as many files as you like, each file should not exceed 5mb
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}