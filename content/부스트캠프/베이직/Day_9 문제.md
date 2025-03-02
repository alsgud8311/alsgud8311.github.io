# 학습 목표

- 시스템 로그 파일을 분석해서 원하는 데이터 구조를 설계하고 구현할 수 있다.
    
- 데이터 구조 내용을 탐색하고 분석해서 결과를 생성할 수 있다.
    
- 문자열 분석을 원하는 수준으로 처리할 수 있다.
    

# 사전지식

- 없음.
    

# 기능요구사항

[system.log 파일 다운로드](https://lucas-image.codesquad.kr/1701410305471system.log)  
프로그램에서 시스템 로그 파일을 열어서 데이터별로 분류하여 데이터 구조로 구현해야 한다.

  

```
error	14:22:30.608355+0900	airportd	[corewifi] END REQ [GET BSSID] (pid=5617 proc=iStat Menus Status service=com.apple.corewlan-xpc intf=en1 uuid=92833 err=1)
default	14:22:33.784903+0900	Airmail	[C264.1 Hostname#9e7acbfe:993 initial path ((null))] event: path:start @0.000s
info	14:23:16.765320+0900	bluetoothd	canScanNow session:<private>(Unspecified) allowed:1  deviceLocked:0 deviceFirstUnlocked:1 allowedInBKG:1 sessionState:daemon <private>
```

- 로그는 문자열 한 줄마다 하나의 데이터로 구분한다. 한 줄의 마지막은 줄바꿈(`\n`) 문자를 포함한다.
    
- 로그는 다음과 같은 요소를 포함하면 각 요소는 탭문자(`\t`)로 구분한다.
    
    - 로그 레벨
        
        - default, Info, error 등
            
        - 고정된 값이 아니라 새로운 항목이 추가될 수 있다.
            
    - 기록 시각
        
        - `14:22:30.579612+0900` 시간 형식
            
    - 프로세스
        
        - WindowServer, kernel, mDNSResponder 등 문자열
            
    - 기록
        
        - 나머지 문자열
            

# 프로그래밍 요구사항

로그 파일을 분석한 데이터를 바탕으로 다음과 같은 기능을 구현할 수 있는 만큼 구현하세요. 대신 각각 다른 함수로 구현하세요.

- 각 로그 데이터 값을 포함할 객체 또는 타입을 선언해야 합니다.
    
- 로그 레벨 유형별로 필터링할 수 있어야 합니다.
    
- 로그 시각으로 정렬할 수 있어야 합니다.
    
- 프로세스 이름으로 필터링할 수 있어야 합니다.
    
- 프로세스 이름으로 정렬할 수 있어야 합니다.
    
- 로그레벨, 프로세스 별로 카운트값을 가져올 수 있어야 합니다.
    

# 추가 요구 사항

위의 시스템 로그 이외에 규칙에 맞는 데이터 파일을 직접 만들어서 테스트해 보고 학습 결과에 첨부하세요.