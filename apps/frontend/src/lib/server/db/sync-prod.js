import { exec } from 'child_process'
import fs from 'fs'

const sourceDbUrl = process.env.PROD_DB
const targetDbUrl = process.env.DATABASE_URL
const dumpFilePath = 'dump.sql'

// Function to execute shell command
/**
 * @param {string} command
 */
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`)
        return reject(error)
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`)
      }
      console.log(`stdout: ${stdout}`)
      resolve(stdout)
    })
  })
}

// Dump the remote database
async function dumpDatabase() {
  const dumpCommand = `pg_dump "${sourceDbUrl}" > ${dumpFilePath}`
  console.log('Dumping remote database...')
  await executeCommand(dumpCommand)
  console.log('Database dump completed.')
}

// Restore to local database
async function restoreDatabase() {
  const restoreCommand = `psql "${targetDbUrl}" < ${dumpFilePath}`
  console.log('Restoring to local database...')
  await executeCommand(restoreCommand)
  console.log('Database restore completed.')
}

// Clean up dump file
function cleanUp() {
  fs.unlink(dumpFilePath, (err) => {
    if (err) {
      console.error(`Error deleting dump file: ${err.message}`)
    } else {
      console.log('Dump file deleted successfully.')
    }
  })
}

// Main function to run the entire process
async function main() {
  try {
    await dumpDatabase()
    await restoreDatabase()
    cleanUp()
  } catch (error) {
    console.error('An error occurred:', error)
  }
}

// Run the script
void main()
