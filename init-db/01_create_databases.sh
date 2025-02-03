
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE storefront_dev;
    CREATE DATABASE storefront_test;
    
    GRANT ALL PRIVILEGES ON DATABASE storefront_dev TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE storefront_test TO $POSTGRES_USER;
EOSQL