import { S3Client } from "@aws-sdk/client-s3"
import * as Form from '@radix-ui/react-form';
import { Button, ContextMenu, Dialog, Flex, Table, TextField, TextArea } from "@radix-ui/themes"
import { useEffect, useState } from "react"

function Menu({ children }) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        {children}
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item shortcut="⌘ n">Nouveau</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item shortcut="⌘ R">Renommer</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item>Partager</ContextMenu.Item>
        <ContextMenu.Item>Ajouter aux favoris</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item shortcut="⌘ ⌫" color="red">
          Supprimer
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>

  )
}

type FinderProps = {
  s3Client: S3Client
  bucket: string
  root: FileSystemDirectoryHandle
}

type NewPageProps = {
  root: FileSystemDirectoryHandle
  tree: Map<string, object>
  setTree: Function
}

function NewPage({ root, tree, setTree }: NewPageProps) {
  const [open, setOpen] = useState(false);

  async function createFile(path: string, content: string) {
    const directoryHandle = await root.getDirectoryHandle("pages");
    const pages = await directoryHandle.getDirectoryHandle(
      `pages`,
      { create: true },
    );
    const fileHandle = await pages.getFileHandle(
      `${[path]}.md`,
      { create: true },
    );

    const fileWriteHandler = await fileHandle.createWritable()
    fileWriteHandler.write(content)
    fileWriteHandler.close()

  }

  useEffect(() => {
    if (!root) {
      return
    }

    async function fetchPages(name = "pages", childHandle: FileSystemDirectoryHandle | FileSystemFileHandle | null) {
      const updatedTree = new Map(tree)
      let fileOrDirectoryHandle = childHandle

      if (!fileOrDirectoryHandle) {
        fileOrDirectoryHandle = await root.getDirectoryHandle(name, {
          create: true,
        });
      }

      for await (let [name, handle] of fileOrDirectoryHandle.entries()) {
        const leaf = { handle }
        console.log({ handle })

        if (handle.kind === "file") {
          leaf.file = await handle.getFile()
        }

        updatedTree.set(name, leaf)
      }
      setTree(updatedTree)
    }
    fetchPages("pages", null)

  }, [])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button>Nouvelle page</Button>
      </Dialog.Trigger>

      <Dialog.Content>
        <Form.Root className="FormRoot"
          onSubmit={async (event) => {
            event.preventDefault();
            setOpen(false);
            // TODO: crete new file
            const { title, body } = Object.fromEntries(new FormData(event.currentTarget))
            await createFile(title.toString(), body.toString())
          }}
        >
          <Dialog.Title>Nouvelle page</Dialog.Title>
          <Flex gap="2" direction="column">
            <Form.Field name="title">
              <Form.Label>Titre</Form.Label>
              <Form.Control asChild>
                <TextField.Root />
              </Form.Control>
            </Form.Field>
            <Form.Field name="body">
              <Form.Label>Contenu</Form.Label>
              <Form.Control asChild>
                <TextArea />
              </Form.Control>
            </Form.Field>
            <Form.Submit asChild>
              <Button style={{ marginRight: "auto" }}>Créer la page !</Button>
            </Form.Submit>
          </Flex>
        </Form.Root>
      </Dialog.Content>
    </Dialog.Root >
  )

}

export function Finder({ root, s3Client, bucket }: FinderProps) {
  const [tree, setTree] = useState(new Map())
  return (
    <Flex gap="4" direction="column">
      <NewPage tree={tree} root={root} setTree={setTree} />
      <Menu>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Nom</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Taille</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {Array.from(tree.entries()).map(([key, value]) => <Table.Row key={key}>
              <Table.RowHeaderCell>{value.handle.name}</Table.RowHeaderCell>
              {value?.file &&
                <Table.Cell>{value.file.size}</Table.Cell>
              }
            </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Menu>
    </Flex>
  )
}

