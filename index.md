# [≡](#contents) [C++ submodule manager](#) [![Gitter](https://badges.gitter.im/cppsm/community.svg)](https://gitter.im/cppsm/community) [![Build Status](https://travis-ci.org/cppsm/cppsm-cli.svg?branch=master)](https://travis-ci.org/cppsm/cppsm-cli) [![Code Coverage](https://img.shields.io/codecov/c/github/cppsm/cppsm-cli/master.svg)](https://codecov.io/github/cppsm/cppsm-cli?branch=master)

The C++ submodule manager is fundamentally a set of [conventions](#conventions)
for structuring projects with [Git](https://git-scm.com/) and
[CMake](https://cmake.org/) rather than just [a new tool](#cppsm-command). The
goal is to make it economical to compose projects from independently developed
packages. You can basically spin off a library with CI integration and with
dependencies to other libraries and have it usable as a manageable dependency in
other projects in a matter of minutes or less.

Basic features:

- Decentralized package storage via [Git](https://git-scm.com/)
- Deterministic dependencies via [Git](https://git-scm.com/)
- Cross-platform via [Git](https://git-scm.com/) and [CMake](https://cmake.org/)

Additional features:

- [Command line tool](#cppsm-command) to automate operations on projects
  - [Generate project boilerplate](#cppsm-init-library)
  - [Add](#cppsm-add), [remove](#cppsm-remove), [upgrade](#cppsm-upgrade)
    dependencies
  - [Code formatting](#cppsm-format)
  - [Build](#cppsm-build), [test](#cppsm-test), and [watch](#cppsm-test-watch)
  - …
- [CMake functions to minimize boilerplate](#cmake)
- [Travis CI integration](#travis-ci)
- [Codecov integration](#codecov)

See [repositories with the `#cppsm` topic](https://github.com/topics/cppsm).

[GitHub organization](https://github.com/cppsm) subprojects:

- [Issues](https://github.com/cppsm/cppsm.github.io/issues)
- [Command-line interface](https://github.com/cppsm/cppsm-cli)
- [Per project boilerplate](https://github.com/cppsm/cppsm-boilerplate)

## <a id="contents"></a> [≡](#contents) [Contents](#contents)

- [`cppsm` command](#cppsm-command)
  - [Supported platforms](#cppsm-supported-platforms)
  - [Installation](#installation)
    - [Automated installation](#automated-installation)
    - [Manual installation](#manual-installation)
    - [For optional code formatting](#for-optional-code-formatting)
    - [For optional auto completion](#for-optional-auto-completion)
    - [For optional watch commands](#for-optional-watch-commands)
  - [Quick tour](#quick-tour)
  - [Subcommands](#subcommands)
    - [`cppsm`](#cppsm)
    - [`cppsm add (requires|equipment) <url> <branch>`](#cppsm-add)
    - [`cppsm build`](#cppsm-build)
    - [`cppsm build-watch`](#cppsm-build-watch)
    - [`cppsm clone <url> <branch>`](#cppsm-clone)
    - [`cppsm format`](#cppsm-format)
    - [`cppsm init`](#cppsm-init)
      - [`NAME='...'`](#init-name)
      - [`VERSION='v1'|'...'`](#init-version)
    - [`cppsm init-hello`](#cppsm-init-hello)
    - [`cppsm init-library`](#cppsm-init-library)
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
  - [`conventional-project.cmake`](#conventional-project-cmake)
    - [`add_conventional_targets_under(directory)`](#add_conventional_targets_under)
    - [`add_conventional_targets_provided_under(directory)`](#add_conventional_targets_provided_under)
    - [`add_conventional_targets()`](#add_conventional_targets)
  - [`conventional-targets.cmake`](#conventional-targets-cmake)
    - [`add_conventional_executable(name)`](#add_conventional_executable)
    - [`add_conventional_executable_tests(...)`](#add_conventional_executable_tests)
    - [`add_conventional_library(${LIBRARY_NAME}_${LIBRARY_VERSION})`](#add_conventional_library)
- [Travis CI](#travis-ci)
  - [`CODECOV=0|1`](#codecov)
  - [`FORMAT_CHECK=1|0`](#format_check)
  - [`INSTALL_WAIT=0|1`](#install_wait)
- [Variables](#variables)
  - [`CTEST_OUTPUT_ON_FAILURE=1|0`](#ctest_output_on_failure)
  - [`QUIET=1|0`](#quiet)
    - [`GIT_QUIET=QUIET`](#git_quiet)
    - [`MSBUILD_VERBOSITY=QUIET|MINIMAL|NORMAL|DETAILED|DIAGNOSTIC`](#msbuild_verbosity)
    - [`XCODE_VERBOSITY=quiet|verbose`](#xcode_verbosity)
  - [`NUMBER_OF_PROCESSORS=1|2|...`](#number_of_processors)
    - [`N_PARALLEL_BUILD=NUMBER_OF_PROCESSORS`](#n_parallel_build)
    - [`N_PARALLEL_TEST=NUMBER_OF_PROCESSORS`](#n_parallel_test)
    - [`N_PARALLEL_UPDATE=NUMBER_OF_PROCESSORS`](#n_parallel_update)
  - [`TRACE=0|1`](#trace)
    - [`XTRACE=TRACE`](#xtrace)
- [Conventions](#conventions)
  - [Conventional project structure](#conventional-project-structure)
    - [A project](#project)
      - [The `equipment` directory](#equipment-directory)
      - [The `internals` directory](#internals-directory)
      - [The `provides` directory](#provides-directory)
      - [The `requires` directory](#requires-directory)
    - [A project submodule](#project-submodule)
    - [A target directory](#target-directory)
  - [Conventional target structure](#conventional-target-structure)
    - [A library](#library-target)
    - [Any number of executable tests](#testing-target)
    - [An executable program](#program-target)
  - [Conventional project versioning](#conventional-project-versioning)
    - [`${PROJECT_NAME}`](#project-name)
    - [`${PROJECT_VERSION}`](#project-version)
  - [Conventional library versioning](#conventional-library-versioning)

## <a id="cppsm-command"></a> [≡](#contents) [`cppsm` command](#cppsm-command)

The `cppsm` command is basically a set of fairly simple
[Bash](<https://en.wikipedia.org/wiki/Bash_(Unix_shell)>) scripts that automate
various operations on projects adhering to the C++ submodule manager
[conventions](#conventions). All the hard work is already done by
[Git](https://git-scm.com/), [CMake](https://cmake.org/), and other tools and
services used. Any `cppsm` project can be used and developed without the `cppsm`
command itself.

<a id="cppsm-supported-platforms"></a>The `cppsm` command has been developed
with [Bash](<https://en.wikipedia.org/wiki/Bash_(Unix_shell)>) and used at least
under [macOS](https://www.apple.com/macos/),
[Linux](https://www.linux.org/) ([Ubuntu](https://ubuntu.com/)),
[Cygwin](https://www.cygwin.com/), and [Git BASH](https://gitforwindows.org/).

There currently is no "native" Windows support. I personally have no need for
such support as I'm comfortable using [Cygwin](https://www.cygwin.com/) and
[Git BASH](https://gitforwindows.org/). If you'd like to work on native Windows
support, or support for some other platform, then you are welcome to contribute
to the project!

At the moment the `cppsm` scripts have only been tested under
[Bash](<https://en.wikipedia.org/wiki/Bash_(Unix_shell)>) (compatible) shell
implementations. I would like to support other shells in the future.
Contributions in that regard are also welcome!

### <a id="installation"></a> [≡](#contents) [Installation](#installation)

To install the `cppsm` command you need to clone its
[repository](https://github.com/cppsm/cppsm-cli) and add its `bin` directory to
your `PATH`.

<a id="automated-installation"></a>[Automated installation](#automated-installation)
using the [`install`](https://github.com/cppsm/cppsm-cli/blob/master/install)
script is as easy as running the pipe

```bash
curl -s https://raw.githubusercontent.com/cppsm/cppsm-cli/master/install | bash
```

using [`curl`](https://curl.haxx.se/) or the pipe

```bash
wget -qO- https://raw.githubusercontent.com/cppsm/cppsm-cli/master/install | bash
```

using [`wget`](https://www.gnu.org/software/wget/).

<a id="manual-installation"></a>[Manual installation](#manual-installation) is
not hard either. Just clone the
[`cppsm-cli`](https://github.com/cppsm/cppsm-cli) repository somewhere, e.g.
`$HOME/.cppsm`:

```bash
git clone --single-branch https://github.com/cppsm/cppsm-cli.git "$HOME/.cppsm"
```

And add the following lines to your
[`$HOME/.bashrc` or `$HOME/.bash_profile`](https://www.gnu.org/software/bash/manual/html_node/Bash-Startup-Files.html):

```bash
CPPSM="$HOME/.cppsm"
export PATH="$CPPSM/bin:$PATH"
. "$CPPSM/bash_completion"        # NOTE: This installs optional Bash completion
```

Optional dependencies:

- <a id="for-optional-code-formatting"></a>[For optional code formatting](#for-optional-code-formatting)
  you need to have both
  [`clang-format`](https://clang.llvm.org/docs/ClangFormat.html) and
  [`prettier`](https://prettier.io/) commands in path.

- <a id="for-optional-auto-completion"></a>[For optional auto completion](#for-optional-auto-completion)
  of [GitHub](https://github.com/) urls you must have either
  [`curl`](https://curl.haxx.se/) or
  [`wget`](https://www.gnu.org/software/wget/) command and
  [`jq`](https://stedolan.github.io/jq/) command in path.

- <a id="for-optional-watch-commands"></a>[For optional watch commands](#for-optional-watch-commands)
  you must have the [`fswatch`](http://emcrisostomo.github.io/fswatch/) command
  in path.

### <a id="quick-tour"></a> [≡](#contents) [Quick tour](#quick-tour)

Here is a quick tour of basic `cppsm` functionality.

Create a new empty project:

```bash
mkdir PROJECT && cd "$_"
cppsm init
```

At this point you could try adding dependencies or writing code, but let's
actually try the hello world example:

```bash
cppsm init-hello
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

#### <a id="cppsm"></a> [≡](#contents) [`cppsm`](#cppsm)

When invoked without specifying a subcommand, `cppsm` displays a brief usage
instruction and `cppsm` version information.

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

#### <a id="cppsm-init"></a> [≡](#contents) [`cppsm init`](#cppsm-init)

Initializes a new project with cppsm configuration files when run in an empty
directory or updates an existing project to use the latest configuration files.
See also [`cppsm init-hello`](#cppsm-init-hello) and
[`cppsm init-library`](#cppsm-init-library).

Configuration variables:

- <a id="init-name"></a>[`NAME='...'`](#init-name) specifies the base name for
  the project and defaults to the name of the current directory.

- <a id="init-version"></a>[`VERSION='v1'|'...'`](#init-version) specifies the
  branch and version suffix for the project.

#### <a id="cppsm-init-hello"></a> [≡](#contents) [`cppsm init-hello`](#cppsm-init-hello)

Initializes a new project with an example "Hello, world!" program. This is only
intended for educational purposes. See also [`cppsm init`](#cppsm-init) and
[`cppsm init-library`](#cppsm-init-library).

    CMakeLists.txt
    equipment/
      testing.cpp/
        v1/
          provides/
            CMakeLists.txt
            include/
              testing_v1/
                [...]
            library/
              [...]
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

#### <a id="cppsm-init-library"></a> [≡](#contents) [`cppsm init-library`](#cppsm-init-library)

Initializes a new project with boilerplate for a simple library project in an
empty directory. See also [`cppsm init`](#cppsm-init) and
[`cppsm init-hello`](#cppsm-init-hello).

    CMakeLists.txt
    internals/
      CMakeLists.txt
      testing/
        compile_synopsis_test.cpp
    provides/
      CMakeLists.txt
      include/
        ${LIBRARY_NAME}_${LIBRARY_VERSION}/
          synopsis.hpp

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
[`cppsm init`](#cppsm-init) to update configuration files.

## <a id="cmake"></a> [≡](#contents) [CMake](#cmake)

CMake boilerplate is provided for projects and simple libraries, tests, and
executables.

### <a id="conventional-project-cmake"></a> [≡](#contents) [`conventional-project.cmake`](#conventional-project-cmake)

[`conventional-project.cmake`](https://github.com/cppsm/cppsm-boilerplate/blob/master/conventional-project.cmake)
is a CMake script that (only) defines a number of CMake functions for projects
that adhere to the [project structure](#conventional-project-structure).

Typically, when using the C++ submodule manager, one does not directly call
these functions as they are called by the automatically generated boilerplate
code.

#### <a id="add_conventional_targets_under"></a> [≡](#contents) [`add_conventional_targets_under(directory)`](#add_conventional_targets_under)

Recursively descends into the specified directory tree stopping at directories
containing a`CMakeLists.txt` script and adds those
[target directories](#target-directory) to the project with
[`add_subdirectory`](https://cmake.org/cmake/help/latest/command/add_subdirectory.html).

#### <a id="add_conventional_targets_provided_under"></a> [≡](#contents) [`add_conventional_targets_provided_under(directory)`](#add_conventional_targets_provided_under)

Recursively descends into the specified directory tree stopping at
[project submodule](#project-submodule) directories and adds those submodules to
the project.

- If a project submodule contains a `.cppsm` directory, then the `provides`
  directory of the submodule is added with the
  [`add_conventional_targets_under`](#add_conventional_targets_under) function.

* Otherwise when a project submodule contains a `CMakeLists.txt` script, then
  the directory is added to the project with
  [`add_subdirectory`](https://cmake.org/cmake/help/latest/command/add_subdirectory.html).

#### <a id="add_conventional_targets"></a> [≡](#contents) [`add_conventional_targets()`](#add_conventional_targets)

Adds conventional targets into a [project](#project).

Specifically, calls

- [`add_conventional_targets_provided_under(requires)`](#requires-directory),
  and
- [`add_conventional_targets_under(provides)`](#provides-directory)

and, when called from the top-level of a CMake source tree, also calls

- [`add_conventional_targets_provided_under(equipment)`](#equipment-directory),
  and
- [`add_conventional_targets_under(internals)`](#internals-directory).

### <a id="conventional-targets-cmake"></a> [≡](#contents) [`conventional-targets.cmake`](#conventional-targets-cmake)

[`conventional-targets.cmake`](https://github.com/cppsm/cppsm-boilerplate/blob/master/conventional-targets.cmake)
is a CMake script that (only) defines a number of CMake functions for defining
targets that adhere to the
[conventional target structure](#conventional-target-structure).

#### <a id="add_conventional_executable"></a> [≡](#contents) [`add_conventional_executable(name)`](#add_conventional_executable)

Adds an executable target with the given name. Assumes that the target directory
has implementation files matching the pattern `program/*.{cpp,hpp}`.

    CMakeLists.txt
    program/
      *.{cpp,hpp}

Add dependencies using
[`target_link_libraries`](https://cmake.org/cmake/help/latest/command/target_link_libraries.html)
separately.

#### <a id="add_conventional_executable_tests"></a> [≡](#contents) [`add_conventional_executable_tests(...)`](#add_conventional_executable_tests)

Adds an executable test target per file matching pattern `testing/*.cpp`. The
arguments given to `add_conventional_executable_tests` are passed to
[`target_link_libraries`](https://cmake.org/cmake/help/latest/command/target_link_libraries.html)
for each added test target.

    CMakeLists.txt
    testing/
      *.cpp

#### <a id="add_conventional_library"></a> [≡](#contents) [`add_conventional_library(${LIBRARY_NAME}_${LIBRARY_VERSION})`](#add_conventional_library)

Adds a library target with the given name. Assumes that the target directory has
public header files matching the pattern
[`include/${LIBRARY_NAME}_${LIBRARY_VERSION}/*.hpp`](#conventional-library-versioning)
and implementation files matching the pattern `library/*.{cpp,hpp}`.

    CMakeLists.txt
    include/
      ${LIBRARY_NAME}_${LIBRARY_VERSION}/
        *.hpp
    library/
      *.(cpp|hpp)

Note that inside `include` there is a directory whose name
[`${LIBRARY_NAME}_${LIBRARY_VERSION}`](#conventional-library-versioning)
suggests that it should include both the library name and its major version. The
intention of the directory is to differentiate between the header files of
different targets (and their major versions).

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
or more cppsm commands. These variables can be used both on the [CI](#travis-ci)
and also when using `cppsm` commands locally.

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
- <a id="xcode_verbosity"></a>[`XCODE_VERBOSITY=quiet|verbose`](#xcode_verbosity)
  optionally passes either `-quiet` or `-verbose` flag to the `xcodebuild`
  command. If `XCODE_VERBOSITY` is not explicitly set and `QUIET=1` then
  `XCODE_VERBOSITY` will be set to `quiet`.

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

## <a id="conventions"></a> [≡](#contents) [Conventions](#conventions)

C++ submodule manager projects adhere to conventions to make it simple to
operate on projects and targets programmatically and also to make room for both
independently developed projects and different versions of a single project to
coexist.

In order to understand how these conventions translate into practice, it can be
helpful to play with an example. The [`cppsm init-hello`](#cppsm-init-hello)
script is written for this purpose to generate a simple example project.

### <a id="conventional-project-structure"></a> [≡](#contents) [Conventional project structure](#conventional-project-structure)

Every cppsm project must conform to the project structure, whose rules are
codified into functions defined in the
[`conventional-project.cmake`](#conventional-project-cmake) script and many of
the [subcommands](#subcommands) of the [`cppsm` command](#cppsm-command).

<a id="project"></a>[A project](#project) contains a `.cppsm` subdirectory
(containing the [boilerplate](https://github.com/cppsm/cppsm-boilerplate) files)
and four optional directories as follows:

- <a id="equipment-directory"></a>[The `equipment` directory](#equipment-directory)
  may contain any number of [_project submodules_](#project-submodule) that the
  project internally depends upon.
- <a id="internals-directory"></a>[The `internals` directory](#internals-directory)
  may contain any number of [_target directories_](#target-directory) that are
  internal to the project.
- <a id="provides-directory"></a>[The `provides` directory](#provides-directory)
  may contain any number of [_target directories_](#target-directory) that are
  provided for dependant projects.
- <a id="requires-directory"></a>[The `requires` directory](#requires-directory)
  may contain any number of [_project submodules_](#project-submodule) that the
  provided targets depend upon.

<a id="project-submodule"></a>[A project submodule](#project-submodule) either
contains a [project](#project) or just a `CMakeLists.txt` script. In the former
case the submodule is treated as a cppsm [project](#project) whose targets under
[`provides`](#provides-directory) will be added to the build and in the latter
case the submodule is treated as a foreign CMake project to be added to the
build.

<a id="target-directory"></a>[A target directory](#target-directory) simply
contains a `CMakeLists.txt` script that defines targets.

Note that in the common case when only a single target directory is needed under
[`internals`](#internals-directory) or [`provides`](#provides-directory), there
is no need to create a nested directory for it and the `CMakeLists.txt` script
can go directly under the [`internals`](#internals-directory) or
[`provides`](#provides-directory) directory.

### <a id="conventional-target-structure"></a> [≡](#contents) [Conventional target structure](#conventional-target-structure)

In a cppsm project one may optionally structure targets according to conventions
codified into functions defined in the
[`conventional-targets.cmake`](#conventional-targets-cmake) script. In that case
a target directory may simultaneously contain:

- <a id="library-target"></a>[A library](#library-target) in the
  [`include/${LIBRARY_NAME}_${LIBRARY_VERSION}`](#conventional-library-versioning)
  and `library` directories.
- <a id="testing-target"></a>[Any number of executable tests](#testing-target)
  in the `testing` directory.
- <a id="program-target"></a>[An executable program](#program-target) in the
  `program` directory.

### <a id="conventional-project-versioning"></a> [≡](#contents) [Conventional project versioning](#conventional-project-versioning)

C++ submodule manager [projects](#project) and
[project submodules](#project-submodule) are versioned such that the branches of
a project are named after their (major) version numbers and the version numbers
are part of the paths of submodules containing C++ submodule manager projects.

<a id="project-name"></a>The [`${PROJECT_NAME}`](#project-name) of a C++
submodule manager project is taken to be the last (`/` separated) part of the
URL of the Git project sans the `.git` suffix.

<a id="project-version"></a>The [`${PROJECT_VERSION}`](#project-version) of a
cppsm project is the name of a branch.

When added as a submodule dependency, a cppsm project whose name is
[`${PROJECT_NAME}`](#project-name) and whose version is
[`${PROJECT_VERSION}`](#project-version) goes either to
[`equipment/${PROJECT_NAME}/${PROJECT_VERSION}`](#equipment-directory) or to
[`requires/${PROJECT_NAME}/${PROJECT_VERSION}`](#requires-directory) depending
on the nature of the dependency.

### <a id="conventional-library-versioning"></a> [≡](#contents) [Conventional library versioning](#conventional-library-versioning)

In a cppsm project one may optionally version libraries such that their header
files start with a directory name of the form `${LIBRARY_NAME}_${VERSION}`,
which is also the name of the CMake [library target](#add_conventional_library)
and of the namespace inside of which all the public code of the library resides
in.

Note that when combined with the
[project versioning conventions](#conventional-project-versioning) this allows a
single project to potentially use multiple (major or incompatible) versions of a
single project or library. This can be very important in large projects composed
of separately develop subprojects or libraries.

Note that often `LIBRARY_NAME` may be the same as
[`PROJECT_NAME`](#project-name) and `LIBRARY_VERSION` may be the same as
[`PROJECT_VERSION`](#project-version), but this is not required.
