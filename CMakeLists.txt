cmake_minimum_required(VERSION 4.0)

find_package(cmake-bare REQUIRED PATHS node_modules/cmake-bare)
find_package(cmake-fetch REQUIRED PATHS node_modules/cmake-fetch)
find_package(cmake-napi REQUIRED PATHS node_modules/cmake-napi)
find_package(cmake-npm REQUIRED PATHS node_modules/cmake-npm)

project(bare_sqlite C)

option(BARE_SQLITE_ENABLE_TEST_STATIC_EXTENSION "Build the test static extension" OFF)
set(BARE_SQLITE_STATIC_EXTENSION_SOURCE "" CACHE FILEPATH "Source file that defines bare_sqlite_static_extensions")

fetch_package("https://sqlite.org/2026/sqlite-amalgamation-3530100.zip" SOURCE_DIR sqlite3)

add_library(sqlite3)

target_sources(
  sqlite3
  PRIVATE
    ${sqlite3}/sqlite3.c
)

target_include_directories(
  sqlite3
  INTERFACE
    ${sqlite3}
)

target_compile_definitions(
  sqlite3
  PRIVATE
    SQLITE_ENABLE_COLUMN_METADATA
)

if(BARE_SQLITE_STATIC_EXTENSION_SOURCE)
  set(bare_sqlite_static_extension_source "${BARE_SQLITE_STATIC_EXTENSION_SOURCE}")
else()
  set(bare_sqlite_static_extension_source static-extensions.c)
endif()

set(bare_sqlite_static_extension_definitions)
set(bare_sqlite_static_extension_libraries)
set(bare_sqlite_static_extension_sources)

if(BARE_SQLITE_ENABLE_TEST_STATIC_EXTENSION)
  list(APPEND bare_sqlite_static_extension_definitions BARE_SQLITE_ENABLE_TEST_STATIC_EXTENSION)
  list(APPEND bare_sqlite_static_extension_sources test/static-extension.c)
endif()

function(configure_bare_sqlite_target target)
  target_sources(
    ${target}
    PRIVATE
      binding.c
      ${bare_sqlite_static_extension_source}
      ${bare_sqlite_static_extension_sources}
  )

  target_include_directories(
    ${target}
    PRIVATE
      ${CMAKE_CURRENT_SOURCE_DIR}
  )

  target_compile_definitions(
    ${target}
    PRIVATE
      ${bare_sqlite_static_extension_definitions}
  )

  target_link_libraries(
    ${target}
    PRIVATE
      sqlite3
      ${bare_sqlite_static_extension_libraries}
  )

  if(UNIX)
    target_link_libraries(
      ${target}
      PRIVATE
        m
    )
  endif()
endfunction()

add_bare_module(bare_sqlite)

configure_bare_sqlite_target(${bare_sqlite})

add_napi_module(bare_sqlite_node)

configure_bare_sqlite_target(${bare_sqlite_node})

resolve_node_module(bare-compat-napi compat)

target_include_directories(
  ${bare_sqlite_node}
  PRIVATE
    "${compat}/include"
)
