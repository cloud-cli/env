# env

Storage for app environment variables

## Usage

`cloudy.conf.mjs`:
```ts
import env from '@cloud-cli/env'
export default { env };
```

```bash
cy env.reload
cy env.set --app test --key key --value 123
cy env.apps
cy env.show --app test
cy env.get --app test --key key
cy env.delete --app test --key key
```