import { Button, Dialog } from "@radix-ui/themes";

type BucketChooserProps = {
  open: boolean;
  buckets: Array<unknown>;
  chooseBucket: Function;
}

export function BucketChooser({ open, buckets, chooseBucket }: BucketChooserProps) {
  return (
    <Dialog.Root open={open}>
      <Dialog.Content maxWidth="450px">
      <Dialog.Title>
          Choisissez un bucket
      </Dialog.Title>
        {buckets.map(bucket => <Button key={bucket.Name} onClick={() => chooseBucket(bucket.Name)}>{bucket.Name}</Button>)}
      </Dialog.Content>
    </Dialog.Root>
  )
}
