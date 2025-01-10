import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [tree, setTree] = useState([])

  useEffect(() => {
    async function initOpfs() {
      const opfsRoot = await navigator.storage.getDirectory();
      await opfsRoot.getFileHandle("my first file", {
        create: true,
      });
      const directoryHandle = await opfsRoot.getDirectoryHandle("my first folder", {
        create: true,
      });
      await directoryHandle.getFileHandle(
        "my first nested file",
        { create: true },
      );
      await directoryHandle.getDirectoryHandle(
        "my first nested folder",
        { create: true },
      );
      console.log(directoryHandle)
      const entries = []
      for await (let [name, handle] of directoryHandle) {
        entries.push({ name, handle })
      }
      setTree(entries)
    }
    initOpfs()
  }, [])

  return (
    <>
      {tree?.map(({ name })  => <div key={name}>
        {name}
      </div>
      )}
    </>
  )
}

export default App
