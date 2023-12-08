import data from './PublicationData/allgenes.json'

export const GENE_ID_MAPPING = {
  ENSG00000121446: 'RGSL1',
  ENSG00000050767: 'COL23A1',
  ENSG00000104369: 'JPH1',
  ENSG00000104517: 'UBR5',
  ENSG00000189057: 'FAM111B',
  ENSG00000133048: 'CHI3L1',
  ENSG00000173085: 'COQ2',
  ENSG00000165078: 'CPA6',
  ENSG00000126583: 'PRKCG',
  ENSG00000107815: 'TWNK',
}

export const allGeneData = data.reduce((acc, obj) => {
  if (obj.gene in acc === false) {
    acc[obj.gene] = []
  }
  acc[obj.gene] = [...acc[obj.gene], obj]
  return acc
}, {})

// const getEvidenceForTable = geneId => allGeneData[GENE_ID_MAPPING[geneId]]
