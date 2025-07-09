# DBMS란?
DBMS는 DataBase Management System의 약자로 데이터베이스를 관리하는 시스템이다.
DBMS는 사용자와 DB 사이에서 사용자의 요구에 따라 데이터를 생성해주고 ,DB를 관리한다.

# RDBMS란?
- 페이지 단위 I/O 수행 - 부분 업데이트 가능
- Clustering Index 방식으로 데이터를 효과적으로 읽고 쓸 수 있음
- B+ tree 인덱스를 사용한 효율적인 레코드 검색
- Soft delete, outspcae-update에 가까운 복잡한 방식의 업데이트 및 삭제 지원
- 동시성을 높이고 트랜잭션을 지원하기 위해 MVCC(Multiversion concurruncy control) 메커니즘 사용
