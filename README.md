# pi-zstack

My personal [Pi](https://pi.dev) stack.

`pi-zstack` can be installed as a Pi package, or bootstrapped from GitHub with a curl-to-bash installer.

The preferred install method is the bash installer below. It installs each package directly with `pi install`, which lets Pi keep those packages updated normally.

## Preferred: install from GitHub

```bash
curl -fsSL https://raw.githubusercontent.com/robzolkos/pi-zstack/main/install.sh | bash
```

Safer inspect-first version:

```bash
curl -fsSL https://raw.githubusercontent.com/robzolkos/pi-zstack/main/install.sh -o /tmp/pi-zstack-install.sh
less /tmp/pi-zstack-install.sh
bash /tmp/pi-zstack-install.sh
```

The installer reads [`packages.txt`](./packages.txt), so updating the stack is just adding/removing lines there.

## Alternative: install as a Pi package

```bash
pi install npm:pi-zstack
```

This installs `pi-zstack` as a meta package. Prefer the bash installer if you want Pi to manage and update each package individually.

## Package list

See [`packages.txt`](./packages.txt).

Current packages:

- [`pi-disable-model-skill-invocation`](https://www.npmjs.com/package/pi-disable-model-skill-invocation)
- [`pi-skill-model-effort`](https://www.npmjs.com/package/pi-skill-model-effort)
- [`pi-slopchop`](https://www.npmjs.com/package/pi-slopchop)
