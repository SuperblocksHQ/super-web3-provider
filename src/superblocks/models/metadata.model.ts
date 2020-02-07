export interface ICustomMetadataModel {
    jobId?: string;
    jobURL?: string;
    description?: string;
    hash?: string;
    branch?: string;
    branchUrl?: string;
    commitUrl?: string;
}

export interface IMetadataModel extends ICustomMetadataModel {
    ciJobId?: string;
    buildConfigId?: string;
    superblocks?: string;
}
