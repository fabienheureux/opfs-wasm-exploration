import { Button, Container, Dialog, Flex, TextField } from '@radix-ui/themes';
import { ListBucketsCommand, S3Client } from "@aws-sdk/client-s3";
import * as Form from '@radix-ui/react-form';
import { useEffect, useState } from 'react'
import { BucketChooser } from './BucketChooser';
import { Finder } from './Finder';

function ConnectS3({ setBuckets, setS3Client, s3Client }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({})

  useEffect(() => {
    if (data) {
      const { accessKeyId, secretAccessKey, endpoint, region } = data
      setS3Client(new S3Client({
        credentials: {
          accessKeyId,
          secretAccessKey
        },
        endpoint,
        // bucketEndpoint: true, // Prevents the client to use the bucket name in the endpoint
        forcePathStyle: true,
        region
      }))
    }
  }, [data])

  useEffect(() => {
    if (!s3Client) {
      return
    }
    async function listBuckets() {
      const data = await s3Client.send(new ListBucketsCommand({}));
      setBuckets(data.Buckets)
    }
    listBuckets()

  }, [s3Client])
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button>Se connecter</Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Form.Root className="FormRoot"
          onSubmit={async (event) => {
            setOpen(false);
            setData(Object.fromEntries(new FormData(event.currentTarget)))
            event.preventDefault();
          }}
        >
          <Dialog.Title>Connexion</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Renseigner vos identifiants pour vous connecter à votre bucket.<br />
            Ceux-ci ne sortent pas du navigateur et seront oubliés à la fin de la session.
          </Dialog.Description>

          <Flex gap="2" direction="column">
            <Form.Field name="accessKeyId">
              <Form.Label >AWS Access key</Form.Label>
              <Form.Message match="valueMissing">
                Merci d'indiquer une valeur pour ce champ
              </Form.Message>
              <Form.Control asChild>
                <TextField.Root placeholder="comment-est-votre-blanquette" defaultValue="" />
              </Form.Control>
            </Form.Field>

            <Form.Field name="secretAccessKey">
              <Form.Label >Clé secrète</Form.Label>
              <Form.Message match="valueMissing">
                Merci d'indiquer une valeur
              </Form.Message>
              <Form.Control asChild>
                <TextField.Root type="password" placeholder="la-blanquette-est-bonne" defaultValue="" />
              </Form.Control>
            </Form.Field>

            <Form.Field name="endpoint">
              <Form.Label>Endpoint</Form.Label>
              <Form.Message match="valueMissing">
                Merci d'indiquer une valeur
              </Form.Message>
              <Form.Control asChild>
                <TextField.Root placeholder="https://garage.deuxfleurs.fr" defaultValue="http://localhost:8000" />
              </Form.Control>
            </Form.Field>

            <Form.Field name="region">
              <Form.Label>Région</Form.Label>
              <Form.Message match="valueMissing">
                Merci d'indiquer une valeur
              </Form.Message>
              <Form.Control asChild>
                <TextField.Root placeholder="garage" defaultValue="garage" />
              </Form.Control>
            </Form.Field>

          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Annuler
              </Button>
            </Dialog.Close>
            <Form.Submit asChild>
              <Button style={{ marginRight: "auto" }}>Se connecter</Button>
            </Form.Submit>
          </Flex>
        </Form.Root>
      </Dialog.Content>
    </Dialog.Root>

  )
}

function App() {
  const [root, setRoot] = useState<FileSystemDirectoryHandle | null>()
  const [bucket, setBucket] = useState<string | null>()
  const [buckets, setBuckets] = useState([])
  const [s3Client, setS3Client] = useState<S3Client | undefined>()

  useEffect(() => {
    async function initOpfs() {
      const opfsRoot = await navigator.storage.getDirectory();
      setRoot(opfsRoot)
    }
    initOpfs()
  }, [])

  useEffect(() => {
    if (!bucket || !root) {
      return
    }

    async function createLocalDirectoryForBucket() {
      await root!.getDirectoryHandle(bucket!, {
        create: true,
      });
    }
    createLocalDirectoryForBucket()
  }, [root, bucket])

  return (
    <Container size="1">
      <Flex gap="4" direction="column">
        {bucket ?
          <>
            Vous êtes connecté au bucket {bucket}
            <Finder root={root} s3Client={s3Client} bucket={bucket} />
          </>
          :
          <>
            <ConnectS3 setBuckets={setBuckets} s3Client={s3Client} setS3Client={setS3Client} />
            <BucketChooser buckets={buckets} chooseBucket={setBucket} open={buckets.length > 0 && !bucket} />
          </>
        }
      </Flex>
    </Container>
  )
}

export default App
