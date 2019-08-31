# [≡](#contents) [C++ submodule manager](#) [![Gitter](https://badges.gitter.im/cppsm/community.svg)](https://gitter.im/cppsm/community)

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

- [Project structure](#project-structure)
- [`cppsm` command](#cppsm-command)
  - [Installation](#installation)
  - [Quick tour](#quick-tour)
  - [Subcommands](#subcommands)
    - [`cppsm add (requires|equipment) <url> <branch>`](#cppsm-add)
    - [`cppsm build`](#cppsm-build)
    - [`cppsm build-watch`](#cppsm-build-watch)
    - [`cppsm clone <url> <branch>`](#cppsm-clone)
    - [`cppsm format`](#cppsm-format)
    - [`cppsm hello`](#cppsm-hello)
    - [`cppsm init`](#cppsm-init)
    - [`cppsm list`](#cppsm-list)
    - [`cppsm remove <path>`](#cppsm-remove)
    - [`cppsm setup`](#cppsm-setup)
      - [`CMAKE_BUILD_TYPE=Debug|Release`](#cmake_build_type)
      - [`CMAKE_GENERATOR=''|'...'`](#cmake_generator)
      - [`CC=cc|gcc|clang|...`](#cc)
      - [`CXX=c++|g++|clang++|...`](#cxx)
      - [`CLEAN=0|1`](#clean)
      - [`COVERAGE=0|1`](#coverage)
    - [`cppsm test`](#cppsm-test)
    - [`cppsm test-watch`](#cppsm-test-watch)
    - [`cppsm update`](#cppsm-update)
    - [`cppsm upgrade`](#cppsm-upgrade)
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
  - [`CTEST_OUTPUT_ON_FAILURE=1|0`](#ctest_output_on_failure)
  - [`QUIET=1|0`](#quiet)
    - [`GIT_QUIET=QUIET`](#git_quiet)
    - [`MSBUILD_VERBOSITY=QUIET|MINIMAL|NORMAL|DETAILED|DIAGNOSTIC`](#msbuild_verbosity)
  - [`NUMBER_OF_PROCESSORS=1|2|...`](#number_of_processors)
    - [`N_PARALLEL_BUILD=NUMBER_OF_PROCESSORS`](#n_parallel_build)
    - [`N_PARALLEL_TEST=NUMBER_OF_PROCESSORS`](#n_parallel_test)
    - [`N_PARALLEL_UPDATE=NUMBER_OF_PROCESSORS`](#n_parallel_update)
  - [`TRACE=0|1`](#trace)
    - [`XTRACE=TRACE`](#xtrace)

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

## <a id="cppsm-command"></a> [≡](#contents) [`cppsm` command](#cppsm-command)

The `cppsm` command automates various operations on projects adhering to the C++
submodule manager conventions.

### <a id="installation"></a> [≡](#contents) [Installation](#installation)

To install the `cppsm` command you need to clone its
[repository](https://github.com/cppsm/cppsm-cli) and add it to your `PATH`.

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

### <a id="quick-tour"></a> [≡](#contents) [Quick tour](#quick-tour)

Here is a quick tour of basic `cppsm` functionality.

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

### <a id="subcommands"></a> [≡](#contents) [Subcommands](#subcommands)

Below is reference documentation for each `cppsm` subcommand. Each subcommand
also prints out short instructions to the console in case the invocation is
incorrect.

#### <a id="cppsm-add"></a> [≡](#contents) [`cppsm add (requires|equipment) <url> <branch>`](#cppsm-add)

Adds a new cppsm compatible submodule and recursively the submodules it requires
to the project. This command is idempotent and can be run to e.g. add new
transitive dependencies after updating submodules.

#### <a id="cppsm-build"></a> [≡](#contents) [`cppsm build`](#cppsm-build)

Sets up a build directory and builds the project. See
[`cppsm setup`](#cppsm-setup) for the configuration variables.

#### <a id="cppsm-build-watch"></a> [≡](#contents) [`cppsm build-watch`](#cppsm-build-watch)

Sets up a build directory, builds the project, and starts a file system watch to
build the project on any changes to project files. See
[`cppsm setup`](#cppsm-setup) for the configuration variables.

#### <a id="cppsm-clone"></a> [≡](#contents) [`cppsm clone <url> <branch>`](#cppsm-clone)

Clones the specified cppsm compatible repository and its dependencies.

#### <a id="cppsm-format"></a> [≡](#contents) [`cppsm format`](#cppsm-format)

Formats project files inplace using
[clang-format](https://clang.llvm.org/docs/ClangFormat.html) and
[prettier](https://prettier.io/).

#### <a id="cppsm-hello"></a> [≡](#contents) [`cppsm hello`](#cppsm-hello)

Creates an example "Hello, world!" program in a freshly initialized project
directory.

#### <a id="cppsm-init"></a> [≡](#contents) [`cppsm init`](#cppsm-init)

Initializes a new C++ project with cppsm configuration files or updates an
existing project to use the latest configuration files. Run `cppsm init` in the
top-level directory of a fresh git project.

#### <a id="cppsm-list"></a> [≡](#contents) [`cppsm list`](#cppsm-list)

Prints out a dependency tree of submodules. This command exits with an error
code in case any problems are found in the dependency tree.

#### <a id="cppsm-remove"></a> [≡](#contents) [`cppsm remove <path>`](#cppsm-remove)

Removes a previously required submodule. Note that this command does not remove
submodules transitively.

#### <a id="cppsm-setup"></a> [≡](#contents) [`cppsm setup`](#cppsm-setup)

Sets up a build directory. The build directory name is determined based on the
configuration variables.

Configuration variables:

- <a id="cmake_build_type"></a>[`CMAKE_BUILD_TYPE=Debug|Release`](#cmake_build_type)
  [specifies which configuration to use](https://cmake.org/cmake/help/latest/variable/CMAKE_BUILD_TYPE.html).

- <a id="cmake_generator"></a>[`CMAKE_GENERATOR=''|'...'`](#cmake_generator)
  [specifies which generator to use](https://cmake.org/cmake/help/latest/envvar/CMAKE_GENERATOR.html#envvar:CMAKE_GENERATOR).

- <a id="cc"></a>[`CC=cc|gcc|clang|...`](#cc)
  [specifies which C compiler to use](https://cmake.org/cmake/help/latest/envvar/CC.html).

- <a id="cxx"></a>[`CXX=c++|g++|clang++|...`](#cxx)
  [specifies which C++ compiler to use](https://cmake.org/cmake/help/latest/envvar/CXX.html).

- <a id="clean"></a>[`CLEAN=0|1`](#clean) specifies whether the build directory
  should be recreated from scratch.

- <a id="coverage"></a>[`COVERAGE=0|1`](#coverage) specifies whether the build
  should be configured to generate coverage information. Currently code coverage
  is only supported on [GCC](https://gcc.gnu.org/) and
  [Clang](https://clang.llvm.org/).

#### <a id="cppsm-test"></a> [≡](#contents) [`cppsm test`](#cppsm-test)

Sets up a build directory, builds the project, and runs the tests. See
[`cppsm setup`](#cppsm-setup) for the configuration variables.

#### <a id="cppsm-test-watch"></a> [≡](#contents) [`cppsm test-watch`](#cppsm-test-watch)

Sets up a build directory, builds the project, runs the tests, and starts a file
system watch to build and test the project on any changes to project files. See
[`cppsm setup`](#cppsm-setup) for the configuration variables.

#### <a id="cppsm-update"></a> [≡](#contents) [`cppsm update`](#cppsm-update)

Pulls the current git branch and updates all cppsm managed submodules to the
versions in the branch.

#### <a id="cppsm-upgrade"></a> [≡](#contents) [`cppsm upgrade`](#cppsm-upgrade)

Upgrades all cppsm managed submodules to latest remote versions and runs
`cppsm init` to update configuration files.

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
(Linux, OS X, Windows) and compiler configurations
([Clang](https://clang.llvm.org/), [GCC](https://gcc.gnu.org/),
[Visual C++](https://docs.microsoft.com/en-us/cpp/)). Just add your project to
Travis CI.

- Linux
  - [Clang](https://clang.llvm.org/) (7)
  - [GCC](https://gcc.gnu.org/) (8)
- OS X
  - Apple [Clang](https://clang.llvm.org/) (10)
  - [GCC](https://gcc.gnu.org/) (8)
- Windows
  - [MinGW](http://www.mingw.org/) [GCC](https://gcc.gnu.org/) (8)
  - [Visual C++](https://docs.microsoft.com/en-us/cpp/) (2017, 2019)

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

### <a id="ctest_output_on_failure"></a> [≡](#contents) [`CTEST_OUTPUT_ON_FAILURE=1|0`](#ctest_output_on_failure)

By default CTest is configured to
[log output in case a test fails](https://cmake.org/cmake/help/latest/envvar/CTEST_OUTPUT_ON_FAILURE.html).
Set `CTEST_OUTPUT_ON_FAILURE=0` explicitly to override the default.

### <a id="quiet"></a> [≡](#contents) [`QUIET=1|0`](#quiet)

By default various commands are invoked with quiet settings to reduce noise. Set
`QUIET=0` explicitly to see more output from various commands.

- <a id="git_quiet"></a>[`GIT_QUIET=QUIET`](#git_quiet) controls the `--quiet`
  switch for [Git](https://git-scm.com/) commands.

- <a
  id="msbuild_verbosity"></a>[`MSBUILD_VERBOSITY=QUIET|MINIMAL|NORMAL|DETAILED|DIAGNOSTIC`](#msbuild_verbosity)
  controls the
  [`/VERBOSITY`](https://docs.microsoft.com/en-us/visualstudio/msbuild/msbuild-command-line-reference)
  switch for
  [MSBuild](https://docs.microsoft.com/en-us/visualstudio/msbuild/msbuild). If
  `MSBUILD_VERBOSITY` is not explicitly set and `QUIET=1` then
  `MSBUILD_VERBOSITY` will be set to `QUIET`.

### <a id="number_of_processors"></a> [≡](#contents) [`NUMBER_OF_PROCESSORS=1|2|...`](#number_of_processors)

By default the number of processors is auto detected and parallelism is set
based on the number of processors. Set `NUMBER_OF_PROCESSORS` explicitly to
desired number to override the default.

- <a id="n_parallel_build"></a>[`N_PARALLEL_BUILD=NUMBER_OF_PROCESSORS`](#n_parallel_build)
  controls the
  [`--parallel` option of `cmake --build`](https://cmake.org/cmake/help/latest/manual/cmake.1.html#build-a-project).

- <a id="n_parallel_test"></a>[`N_PARALLEL_TEST=NUMBER_OF_PROCESSORS`](#n_parallel_test)
  controls the
  [`--parallel` option of `ctest`](https://cmake.org/cmake/help/latest/manual/ctest.1.html#options).

- <a id="n_parallel_update"></a>[`N_PARALLEL_UPDATE=NUMBER_OF_PROCESSORS`](#n_parallel_update)
  controls the
  [`--jobs` option of `git submodule update`](https://git-scm.com/docs/git-submodule#Documentation/git-submodule.txt---jobsltngt).

### <a id="trace"></a> [≡](#contents) [`TRACE=0|1`](#trace)

By default scripts do not output trace information to reduce noise. Set
`TRACE=1` explicitly to see trace output.

- <a id="xtrace"></a>[`XTRACE=TRACE`](#xtrace) controls whether to
  [`set -x`](https://www.gnu.org/software/bash/manual/bash.html#The-Set-Builtin)
  to enable Bash xtrace.
