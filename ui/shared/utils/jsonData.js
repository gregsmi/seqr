import data from '../components/panel/variants/PublicationData/allgenes.json'

export const geneData = data
export const geneDataByGene = data1 => data1.reduce((acc, row) => ({ ...acc, [row.gene]: row }), {})
