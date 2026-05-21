#ifndef BARE_SQLITE_H
#define BARE_SQLITE_H

#include <stddef.h>

typedef struct sqlite3 sqlite3;
typedef struct sqlite3_api_routines sqlite3_api_routines;

typedef int (*bare_sqlite_static_extension_init_t)(
  sqlite3 *db,
  char **pzErrMsg,
  const sqlite3_api_routines *pApi
);

typedef struct {
  const char *name;
  bare_sqlite_static_extension_init_t init;
} bare_sqlite_static_extension_t;

const bare_sqlite_static_extension_t *
bare_sqlite_static_extensions(size_t *count);

#endif
