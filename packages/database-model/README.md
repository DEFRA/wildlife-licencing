# Wildlife licencing API

#### For Natural England

Common database definitions - in order that the data model can be shared between processes

![](./wls_db.png)


To run liquibase locally:
/usr/local/opt/liquibase/liquibase --url=jdbc:postgresql://localhost:5432/wls --changelog-file=db.changelog-root.xml --username=wlsuser --password=<password> update
