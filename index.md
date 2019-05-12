# [≡](#contents) [C++ submodule manager](#)

Poor man's submodule management, build scripts, and CI integration for simple,
"conventional" C++ libraries, executable tests, and executable programs on top
of

- [CMake](https://cmake.org/),
- [Git](https://git-scm.com/),
- [Travis CI](https://travis-ci.org/), and
- [Codecov](https://codecov.io/).

The idea is to minimize boilerplate by relying on simple conventions over
excessive configuration.

See [repositories with the `#cppsm` topic](https://github.com/topics/cppsm).

[GitHub organization](https://github.com/cppsm) subprojects:

- [Issues](https://github.com/cppsm/cppsm.github.io/issues)
- [Command-line interface](https://github.com/cppsm/cppsm-cli)
- [Per project boilerplate](https://github.com/cppsm/cppsm-boilerplate)

## <a id="contents"></a> [≡](#contents) [Contents](#contents)

- [Install](#install)
- [Synopsis](#synopsis)
- [Project structure](#project-structure)
- [CMake](#cmake)
  - [`conventional.cmake`](#conventional-cmake)
    - [`add_conventional_executable(name)`](#add_conventional_executable)
    - [`add_conventional_executable_tests(...)`](#add_conventional_executable_tests)
    - [`add_conventional_library(name)`](#add_conventional_library)
- [Travis CI](#travis-ci)
  - [`CODECOV=0|1`](#codecov)
  - [`FORMAT_CHECK=1|0`](#format_check)
  - [`INSTALL_WAIT=0|1`](#install_wait)
- [Variables](#variables)
  - [`GIT_QUIET=1|0`](#git_quiet)
  - [`NUMBER_OF_PROCESSORS=1|2|...`](#number_of_processors)
  - [`N_PARALLEL_BUILD=1|2|...`](#n_parallel_build)
  - [`N_PARALLEL_TEST=1|2|...`](#n_parallel_test)
  - [`N_PARALLEL_UPDATE=1|2|...`](#n_parallel_update)
  - [`XTRACE=0|1`](#xtrace)

## <a id="install"></a> [≡](#contents) [Install](#install)

Clone the `cppsm-cli` somewhere:

```bash
git clone https://github.com/cppsm/cppsm-cli.git
```

Add to your `.bash_profile`:

```bash
CPPSM="path to cppsm-cli directory"
export PATH="$CPPSM/bin:$PATH"
. "$CPPSM/bash_completion"
```

For code formatting you need to have both
[`clang-format`](https://clang.llvm.org/docs/ClangFormat.html) and
[`prettier`](https://prettier.io/) commands in path.

For the optional auto completion of git urls you must have both
[`curl`](https://curl.haxx.se/) and [`jq`](https://stedolan.github.io/jq/)
commands in path.

## <a id="synopsis"></a> [≡](#contents) [Synopsis](#synopsis)

Create a new project:

```bash
mkdir PROJECT && cd "$_"
git init
cppsm init
```

Try the hello world example (after `init`):

```bash
cppsm hello
cppsm test
.build*/internals/hello
```

Start hacking:

```bash
emacs internals/program/hello.cpp &
cppsm test-watch
```

Format project files inplace:

```bash
cppsm format
```

Clone an existing project:

```bash
cppsm clone URL BRANCH
```

Or clone an existing project using plain git:

```bash
git clone -b BRANCH URL/NAME.git
cd NAME
git submodule update --init     # NOTE: non-recursive
```

Add a required library:

```bash
cppsm add requires URL/NAME.git BRANCH
```

Remove a previously required library:

```bash
cppsm remove requires/NAME/BRANCH
```

Upgrade all required libraries:

```bash
cppsm upgrade
```

## <a id="project-structure"></a> [≡](#contents) [Project structure](#project-structure)

At the root of a project there are three directories as follows:

- The `equipment` directory may contain any number of _project submodules_ that
  the project internally depends upon.
- The `internals` directory may contain one or more _target directories_ that
  are internal to the project.
- The `provides` directory may contain one or more _target directories_ that are
  provided for dependant projects.
- The `requires` directory may contain any number of _project submodules_ that
  the provided targets depend upon.

In other words, both `internals` and `provides` may contain one or more target
directories. In case only a single `internal` or `provides` target directory is
needed, there is no need to create a nested directory.

A single _target directory_ may simultaneously contain

- a library in the `include/${name}` and `library` directories,
- any number of executable tests in the `testing` directory, and
- an executable program in the `program` directory.

Try the `cppsm hello` script. It generates a simple example project that has
essentially the following structure:

    CMakeLists.txt
    equipment/
      testing.cpp/
        v1/
          provides/
            CMakeLists.txt
            include/
              testing_v1/
                test_synopsis.hpp
                test.hpp
            library/
              test.cpp
    internals/
      CMakeLists.txt
      testing/
        message_test.cpp
      program/
        hello.cpp
    provides/
      CMakeLists.txt
      include/
        message_v1/
          hello.hpp
      library/
        hello.cpp

Note that the include directories are versioned as are CMake target names and
C++ namespace names. This allows multiple major versions of a library to be used
simultaneously.

## <a id="cmake"></a> [≡](#contents) [CMake](#cmake)

CMake boilerplate is provided for simple libraries, tests, and executables.

### <a id="conventional-cmake"></a> [≡](#contents) [`conventional.cmake`](#conventional-cmake)

#### <a id="add_conventional_executable"></a> [≡](#contents) [`add_conventional_executable(name)`](#add_conventional_executable)

Adds an executable target with the given name. Assumes that the target directory
has implementation files matching the pattern `program/*.{cpp,hpp}`.

    CMakeLists.txt
    program/
      *.{cpp,hpp}

Add dependencies using `target_link_libraries` separately.

#### <a id="add_conventional_executable_tests"></a> [≡](#contents) [`add_conventional_executable_tests(...)`](#add_conventional_executable_tests)

Adds an executable test target per file matching pattern `testing/*.cpp`. The
arguments given to `add_conventional_executable_tests` are passed to
`target_link_libraries` for each added test target.

    CMakeLists.txt
    testing/
      *.cpp

#### <a id="add_conventional_library"></a> [≡](#contents) [`add_conventional_library(name)`](#add_conventional_library)

Adds a library target with the given name. Assumes that the target directory has
public header files matching the pattern `include/${name}/*.hpp` and
implementation files matching the pattern `library/*.{cpp,hpp}`.

    CMakeLists.txt
    include/
      ${name}/
        *.hpp
    library/
      *.(cpp|hpp)

Note that inside `include` there is a directory with the target `${name}` (which
should also include the major version) to differentiate between the header files
of different targets (and their major versions).

## <a id="travis-ci"></a> [≡](#contents) [Travis CI](#travis-ci)

A [Travis CI](https://travis-ci-ci.org/)
[configuration file](https://github.com/cppsm/cppsm-cli/blob/master/.travis.yml)
is provided to build and test both `Debug` and `Release` builds on various OS
(Linux, OS X, Windows) and compiler configurations (Clang, GCC, Visual C++).
Just add your project to Travis CI.

- Linux
  - Clang (7)
  - GCC (8)
- OS X
  - Apple Clang (10)
  - GCC (8)
- Windows
  - MinGW GCC (8)
  - Visual C++ (2017)

### <a id="codecov"></a> [≡](#contents) [`CODECOV=0|1`](#codecov)

By default the
[CI script](https://github.com/cppsm/cppsm-cli/blob/master/travis-ci) does not
generate and push code coverage results to [Codecov](https://codecov.io/). Set
`CODECOV=1` to enable code coverage.

### <a id="format_check"></a> [≡](#contents) [`FORMAT_CHECK=1|0`](#format_check)

By default the
[CI script](https://github.com/cppsm/cppsm-cli/blob/master/travis-ci) checks
that source files have been formatted as with `cppsm format`. Set
`FORMAT_CHECK=0` explicitly to disable the format check.

### <a id="install_wait"></a> [≡](#contents) [`INSTALL_WAIT=0|1`](#install_wait)

By default the
[CI script](https://github.com/cppsm/cppsm-cli/blob/master/travis-ci) performs
installation of additional packages concurrently with builds when possible. Set
`INSTALL_WAIT=1` to wait for installations to complete before starting any
builds.

## <a id="variables"></a> [≡](#contents) [Variables](#variables)

Several environment variables can be set to change the default behavior of one
or more C++ submodule manager commands. These variables can be used both on the
[CI](#travis-ci) and also when using `cppsm` commands locally.

### <a id="git_quiet"></a> [≡](#contents) [`GIT_QUIET=1|0`](#git_quiet)

By default [Git](https://git-scm.com/) commands are invoked with the `--quiet`
flag to reduce noise. Set `GIT_QUIET=0` to see git command output.

### <a id="number_of_processors"></a> [≡](#contents) [`NUMBER_OF_PROCESSORS=1|2|...`](#number_of_processors)

By default the number of processors is auto detected and parallelism is set to
match the number of processors. Set `NUMBER_OF_PROCESSORS` explicitly to desired
number to override the default.

### <a id="n_parallel_build"></a> [≡](#contents) [`N_PARALLEL_BUILD=1|2|...`](#n_parallel_build)

By default builds are performed with level of parallelism set to the
[`NUMBER_OF_PROCESSORS`](#number_of_processors). Set `N_PARALLEL_BUILD`
explicitly to desired number to override the default.

### <a id="n_parallel_test"></a> [≡](#contents) [`N_PARALLEL_TEST=1|2|...`](#n_parallel_test)

By default tests are run with level of parallelism set to the
[`NUMBER_OF_PROCESSORS`](#number_of_processors). Set `N_PARALLEL_TEST`
explicitly to desired number to override the default.

### <a id="n_parallel_update"></a> [≡](#contents) [`N_PARALLEL_UPDATE=1|2|...`](#n_parallel_update)

By default
[Git submodule updates](https://git-scm.com/docs/git-submodule#Documentation/git-submodule.txt---jobsltngt)
are run with level of parallelism set to the
[`NUMBER_OF_PROCESSORS`](#number_of_processors). Set `N_PARALLEL_UPDATE`
explicitly to desired number to override the default.

### <a id="xtrace"></a> [≡](#contents) [`XTRACE=0|1`](#xtrace)

By default scripts do not
[`set -x`](https://www.gnu.org/software/bash/manual/bash.html#The-Set-Builtin)
to enable Bash xtrace to avoid unnecessary noise. Set `XTRACE=1` to enable Bash
xtrace.
