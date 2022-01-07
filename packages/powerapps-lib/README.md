# Wildlife licencing - Powerapps lib

#### For Natural England

(1) Performs the following actions against the target Microsoft Powerapps Instance
    
- Inserts new application data
- Updates existing application data

On failure, it will throw either a _recoverable_ or _unrecoverable_ exception in order than the queue process can act accordingly

On success, it will return a new keys object for storage in the source postgres database



