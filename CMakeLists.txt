cmake_minimum_required(VERSION 4.0)

find_package(cmake-bare REQUIRED PATHS node_modules/cmake-bare)
find_package(cmake-fetch REQUIRED PATHS node_modules/cmake-fetch)
find_package(cmake-napi REQUIRED PATHS node_modules/cmake-napi)
find_package(cmake-npm REQUIRED PATHS node_modules/cmake-npm)

project(bare_sqlite C)

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

add_bare_module(bare_sqlite)

target_sources(
  ${bare_sqlite}
  PRIVATE
    binding.c
)

target_link_libraries(
  ${bare_sqlite}
  PRIVATE
    sqlite3
)

add_napi_module(bare_sqlite_node)

target_sources(
  ${bare_sqlite_node}
  PRIVATE
    binding.c
)

target_link_libraries(
  ${bare_sqlite_node}
  PRIVATE
    sqlite3
)

resolve_node_module(bare-compat-napi compat)

target_include_directories(
  ${bare_sqlite_node}
  PRIVATE
    "${compat}/include"
)
