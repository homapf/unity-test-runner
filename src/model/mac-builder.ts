import { execWithErrorCheck } from './exec-with-error-check';

class MacBuilder {
    public static async run(actionFolder: string, silent: boolean = false) {
        await execWithErrorCheck('bash', [`${actionFolder}/entrypoint.sh`], {
            silent,
        });
    }
}

export default MacBuilder;