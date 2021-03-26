# Build

This is a small cli tool I made to help me build monorepo projects because I am extremely lazy

## Configuration

The file name searched for by this is `.buildrc` however you can pass your own configs to it

You can see the build configuration's json schema (v7) in [build.schema.json](build.schema.json) or as a typescript
interface in [config.ts](src/config.ts)

See an example [here](https://github.com/confuscript/confuscript/blob/master/.buildrc)
