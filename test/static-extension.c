#define SQLITE_CORE

#include <sqlite3ext.h>
#include <stddef.h>

#include "../bare-sqlite.h"

static void
bare_sqlite_test_value(sqlite3_context *context, int argc, sqlite3_value **argv) {
  (void) argc;
  (void) argv;

  sqlite3_result_text(context, "static-ok", -1, SQLITE_STATIC);
}

int
sqlite3_bare_sqlite_test_init(sqlite3 *db, char **pzErrMsg, const sqlite3_api_routines *pApi) {
  (void) pzErrMsg;
  (void) pApi;

  return sqlite3_create_function(
    db,
    "bare_sqlite_static_test",
    0,
    SQLITE_UTF8 | SQLITE_DETERMINISTIC,
    NULL,
    bare_sqlite_test_value,
    NULL,
    NULL
  );
}
