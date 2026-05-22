#include "bare-sqlite-static-extensions.h"

#if defined(BARE_SQLITE_ENABLE_TEST_STATIC_EXTENSION)
int
sqlite3_bare_sqlite_test_init(sqlite3 *db, char **pzErrMsg, const sqlite3_api_routines *pApi);
#endif

const bare_sqlite_static_extension_t *
bare_sqlite_static_extensions(size_t *count) {
#if defined(BARE_SQLITE_ENABLE_TEST_STATIC_EXTENSION)
  static const bare_sqlite_static_extension_t extensions[] = {
#if defined(BARE_SQLITE_ENABLE_TEST_STATIC_EXTENSION)
    {"bare_sqlite_test", sqlite3_bare_sqlite_test_init},
#endif
  };

  *count = sizeof(extensions) / sizeof(extensions[0]);
  return extensions;
#else
  *count = 0;
  return NULL;
#endif
}
